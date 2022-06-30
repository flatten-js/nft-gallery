(async () => {
  const THREE = require('three')
  const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js')
  const { PointerLockControls } = require('three/examples/jsm/controls/PointerLockControls.js')

  const axios = require('axios')

  /*
   *
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
   *
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

  const { data: textures } = await axios('/api/textures')

  const loader = new GLTFLoader()
  loader.load('/assets/model/gallery.glb', glb => {
    const model = glb.scene
    model.traverse(node => {
      let texture = textures.find(texture => texture.name == node.name)
      if (texture) {
        new THREE.TextureLoader().load(texture.url, texture => {
          node.material = new THREE.MeshBasicMaterial({ map: texture })
        })
      }
    })
    scene.add(glb.scene)
  })

  const $overlay = document.getElementById('overlay')

  const controls = new PointerLockControls(camera, renderer.domElement)
  $overlay.addEventListener('click', () => controls.lock())
  controls.addEventListener('lock', () => $overlay.style.display = 'none')
  controls.addEventListener('unlock', () => $overlay.style.display = 'flex')

  const keys = { w: false, a: false, s: false, d: false }
  document.addEventListener('keydown', e => { keys[e.key] = true })
  document.addEventListener('keyup', e => { keys[e.key] = false })

  const direction = new THREE.Vector3()
  const velocity = new THREE.Vector3()

  /*
   *
   */

  function animate() {
    requestAnimationFrame(animate)

    if (controls.isLocked) {
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

    renderer.render(scene, camera)
  }

  animate()
})()
