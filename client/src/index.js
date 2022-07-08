(async () => {
  const THREE = require('three')
  const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js')
  const { PointerLockControls } = require('three/examples/jsm/controls/PointerLockControls.js')

  const axios = require('axios')

  /*
   * Global
   */

  const { data: owner_address } = await axios.get('/api/owner')

  const $title = document.getElementById('title')
  const $owned_by = document.getElementById('title-footer__owner')

  const $metamask = document.getElementById('header__metamask')
  const $address = document.getElementById('header__address')

  const $caption = document.getElementById('caption')
  const $caption_title = document.getElementById('caption-header__title')
  const $caption_creator = document.getElementById('caption-header__creator')
  const $caption_description = document.getElementById('caption-body__description')
  const $caption_index = document.getElementById('caption-footer__index')

  const $assets = document.getElementById('assets')
  const $overlay = document.getElementById('assets__overlay')
  const $nfts = document.getElementById('assets-body-inner__nfts')
  const $reconnect = document.getElementById('assets-body__reconnect')

  let edit_mode
  let address
  let looking_at
  let assets

  async function auth_verify(address, nonce) {
    const message = `Nonce: ${nonce}`
    const sign = await ethereum.request({ method: 'personal_sign', params: [address, message] })
    return await axios.get('/api/auth/verify', { params: { message, sign } })
  }

  function setting_caption(looking_at) {
    $caption_title.innerText = looking_at.userData.name || looking_at.userData._name
    $caption_creator.innerText = looking_at.userData.creator_address
    $caption_description.innerText = String(looking_at.userData.description).replace(/\r?\n/g, ' ')
    $caption_index.innerText = looking_at.name.substr(-3)
    $caption.style.display = 'block'
  }

  function setting_assets(assets) {
    assets.forEach(asset => {
      $nfts.insertAdjacentHTML('beforeend', `
        <div class="nft">
          <img src="${asset.image}" />
          <div class="nft__body">
            <div>${asset.name}</div>
          </div>
        </div>
      `)
    })

    $nfts.querySelectorAll('.nft').forEach(($, i) => {
      $.addEventListener('click', e => {
        const asset = assets[i]
        new THREE.TextureLoader().load(asset.image, map => {
          map.encoding = THREE.sRGBEncoding

          const a = [asset.contractAddress, asset.token_id]
          const b = [looking_at.userData.contractAddress, looking_at.userData.token_id]

          if (JSON.stringify(a) == JSON.stringify(b)) {
            looking_at.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(0, 0, 0) })
            looking_at.userData = { _name: looking_at.userData._name }
            axios.get('/api/texture/delete', { params: { target: looking_at.name } })
          } else {
            looking_at.material = new THREE.MeshBasicMaterial({ map })
            looking_at.userData = { ...asset, _name: looking_at.userData._name }
            axios.post('/api/texture/add', { ...looking_at.userData, target: looking_at.name })
          }

          setting_caption(looking_at)
        })
      })
    })
  }

  /*
   * Init
   */

  $owned_by.innerText += owner_address

  const scene = new THREE.Scene()
  scene.rotation.y = Math.PI
  scene.position.z = -32.5

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50)
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

  if (window.ethereum) {
    const { ethereum } = window

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
          await auth_verify(address, nonce)
        } catch (e) {
          console.error(e)
        }
      }

      $metamask.style.display = 'none'
      $address.innerText = address
    })
  }

  const { data: textures } = await axios('/api/textures')

  const loader = new GLTFLoader()
  loader.load('/assets/model/gallery.glb', glb => {
    const model = glb.scene
    model.traverse(node => {
      node.userData._name = node.userData.name

      let texture = textures.find(texture => texture.target == node.name)
      if (texture) {
        new THREE.TextureLoader().load(texture.image, map => {
          map.encoding = THREE.sRGBEncoding
          node.material = new THREE.MeshBasicMaterial({ map })
          node.userData = { ...node.userData, ...texture }
        })
      }
    })
    scene.add(glb.scene)
  })

  const controls = new PointerLockControls(camera, renderer.domElement)
  controls.pointerSpeed = 0.5
  $title.addEventListener('click', () => controls.lock())
  controls.addEventListener('lock', () => $title.style.display = 'none')
  controls.addEventListener('unlock', () => { if (!edit_mode) $title.style.display = 'flex' })

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

  $overlay.addEventListener('click', e => {
    edit_mode = false
    controls.lock()
    $assets.style.display = 'none'
    $nfts.innerHTML = ''
  }, true)

  $reconnect.addEventListener('click', async e => {
    try {
      const { data: nonce } = await axios.get('/api/auth/nonce', { params: { address } })
      await auth_verify(address, nonce)

      $reconnect.style.display = 'none'
      if (!assets) ({ data: assets } = await axios.get('/api/assets'))

      setting_assets(assets)
    } catch (e) {
      console.error(e)
      $reconnect.style.display = 'block'
    }
  })

  document.addEventListener('keyup', async e => {
    switch (e.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        keys[e.key] = false
        break

      case 'e':
        if (address == owner_address.toLowerCase() && looking_at) {
          edit_mode = true
          controls.unlock()
          $assets.style.display = 'block'

          try {
            if (!assets) ({ data: assets } = await axios.get('/api/assets'))
            setting_assets(assets)
          } catch (e) {
            console.error(e)
            if (e.response.status == 401) $reconnect.style.display = 'block'
          }
        } else if (looking_at?.userData.creator_address) {
          const url = `https://etherscan.io/token/${looking_at.userData.contract_address}?a=${looking_at.userData.token_id}`
          window.open(url, '_blank')
        }

        break
    }
  })

  const raycaster = new THREE.Raycaster()
  function look_at() {
    raycaster.setFromCamera(new THREE.Vector2(), camera)
    const intersects = raycaster.intersectObjects(scene.children)

    if (intersects.length > 0) {
      const [intersect] = intersects
      const { object } = intersect

      if (/Art/.test(object.name) && intersect.distance < 5) {
        if (!looking_at) {
          looking_at = object
          setting_caption(looking_at)
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
    direction.normalize()

    if (w || s) velocity.z -= direction.z * 0.025
    if (a || d) velocity.x -= direction.x * 0.025

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
