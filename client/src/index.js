(async () => {
  const THREE = require('three')
  const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js')
  const { PointerLockControls } = require('three/examples/jsm/controls/PointerLockControls.js')

  const axios = require('axios')

  /*
   * Global
   */

  let looking_at

  /*
   * Init
   */

  const scene = new THREE.Scene()
  scene.rotation.y = Math.PI
  scene.position.z = -32.5

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.y = 1.6

  const light = new THREE.AmbientLight(0xffffff)
  scene.add(light)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.physicallyCorrectLights = true
  document.body.appendChild(renderer.domElement)

  function onResize() {
    const { innerWidth: width, innerHeight: height, devicePixelRatio } = window
    renderer.setPixelRatio(devicePixelRatio)
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  onResize()

  window.addEventListener('resize', onResize)

  /*
   * Helper
   */

  // const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js')

  // const axesHelper = new THREE.AxesHelper(5)
  // scene.add(axesHelper)
  //
  // const gridHelper = new THREE.GridHelper(100)
  // scene.add(gridHelper)
  //
  // const controls = new OrbitControls(camera, renderer.domElement)

  /*
   *
   */

  let address

  if (window.ethereum) {
    const { ethereum } = window
    const $metamask = document.getElementById('header__metamask')
    const $address = document.getElementById('header__address')

    ethereum.on('accountsChanged', async e => {
      await axios.get('/api/auth/signout')
      address = null
      $address.innerText = ''
      $metamask.style.display = 'block'
    })

    ;[address] = await ethereum.request({ method: 'eth_accounts' })
    if (address) {
      $metamask.style.display = 'none'
      $address.innerText = address
    }

    $metamask.addEventListener('click', async e => {
      e.stopPropagation()

      if (!address) [address] = await ethereum.request({ method: 'eth_requestAccounts' })
      const { data: nonce } = await axios.get('/api/auth/nonce', { params: { address } })

      if (nonce) {
        try {
          const message = `Nonce: ${nonce}`
          const sign = await ethereum.request({ method: 'personal_sign', params: [address, message] })
          await axios.get('/api/auth/verify', { params: { message, sign } })
        } catch (e) {
          console.error(e)
        }
      }

      $metamask.style.display = 'none'
      $address.innerText = address
    })
  }

  const controls = new PointerLockControls(camera, renderer.domElement)
  const $title = document.getElementById('title')
  $title.addEventListener('click', () => controls.lock())
  controls.addEventListener('lock', () => $title.style.display = 'none')
  controls.addEventListener('unlock', () => $title.style.display = 'flex')

  const { data: textures } = await axios('/api/textures')

  const loader = new GLTFLoader()
  loader.load('/assets/model/gallery.glb', glb => {
    const model = glb.scene
    model.traverse(node => {
      let texture = textures.find(texture => texture.target == node.name)
      if (texture) {
        new THREE.TextureLoader().load(texture.url, map => {
          node.material = new THREE.MeshBasicMaterial({ map })
          node.userData = texture.data
        })
      }
    })
    scene.add(glb.scene)
  })

  const keys = { w: false, a: false, s: false, d: false }

  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        keys[e.key] = true
        break
    }
  })

  document.addEventListener('keyup', e => {
    switch (e.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        keys[e.key] = false
        break

      case 'e':
        if (looking_at?.creator_address) {
          const url = `https://etherscan.io/token/${looking_at.contract_address}?a=${looking_at.token_id}`
          window.open(url, '_blank')
        }
        break
    }
  })

  const raycaster = new THREE.Raycaster()
  const $caption = document.getElementById('caption')
  const $caption_title = document.getElementById('caption-header__title')
  const $caption_creator = document.getElementById('caption-header__creator')
  const $caption_description = document.getElementById('caption-body__description')
  const $caption_index = document.getElementById('caption-footer__index')
  function look_at() {
    raycaster.setFromCamera(new THREE.Vector2(), camera)
    const intersects = raycaster.intersectObjects(scene.children)

    if (intersects.length > 0) {
      const [intersect] = intersects
      const { object } = intersect

      if (/Art/.test(object.name) && intersect.distance < 5) {
        if (!looking_at) {
          looking_at = object.userData
          $caption_title.innerText = looking_at.name
          $caption_creator.innerText = looking_at.creator_address
          $caption_description.innerText = looking_at.description
          $caption_index.innerText = object.name.substr(-3)
          $caption.style.display = 'block'
        }
      } else {
        looking_at = null
        $caption.style.display = 'none'
      }
    }
  }

  const direction = new THREE.Vector3()
  const velocity = new THREE.Vector3()
  function movement() {
    const { w, a, s, d } = keys

    velocity.z = 0
    velocity.x = 0
    direction.z = Number(w) - Number(s)
    direction.x = Number(d) - Number(a)

    if (w || s) velocity.z -= direction.z * 0.03
    if (a || d) velocity.x -= direction.x * 0.03

    controls.moveRight(-velocity.x)
    controls.moveForward(-velocity.z)
  }

  /*
   * Loop
   */

  function animate() {
    requestAnimationFrame(animate)

    if (controls.isLocked) {
      look_at()
      movement()
    }

    renderer.render(scene, camera)
  }

  animate()
})()
