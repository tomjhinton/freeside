const CANNON = require('cannon')
const THREE = require('three')
import './style.scss'
import './debug.js'
import 'bulma'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'





//CANNNON && THREE
// Create a
var world, mass, body, shape, timeStep=1/60,
camera, scene, renderer, geometry, material, mesh, groundBody, floor, groundShape, physicsMaterial, ballShape, ballBody, radius, balls=[], ballMeshes=[], group, controls, ceilingBody, ceilingShape , leftWallShape, leftWallBody, rightWallShape, rightWallBody, frontWallShape, frontWallBody, backWallShape, backWallBody, ballMaterial, ballContactMaterial, physicsContactMaterial, score = 0, playerMaterial, playerContactMaterial, wallMaterial, wallContactMaterial, textGeo, playing = true
initGame()
animate()
const scoreboard = document.getElementById('score')
scoreboard.innerHTML = 'SCORE: '+ score


//var loader = new THREE.FontLoader();
// loader.load( '/samples/helvetiker_regular.typeface.json', function ( font ) {
//
//      textGeo = new THREE.TextGeometry( 'Left arm = Forwards & Backwards, Right arm = Left & Right ',  {
//
//         font: font,
//
//         size: 2,
//         height: 2,
//         // curveSegments: 1,
//         // bevelThickness: 0.2,
// 				// bevelSize: 0.5,
// 				// bevelEnabled: true,
// 				// bevelSegments: 2,
// 				// steps: 4
//
//
//
//     } );
//
//     var textMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
//
//     var mesh = new THREE.Mesh( textGeo, textMaterial )
//     mesh.position.set( -30, 15, -5 );
//
//     scene.add( mesh );
//     console.log(textGeo.parameters.text)
//
// } )
//console.log(textGeo)
function initGame() {
  world = new CANNON.World()
  world.gravity.set(0,-10,0)
  world.broadphase = new CANNON.NaiveBroadphase()
  world.solver.iterations = 10

  wallMaterial = new CANNON.Material('wallMaterial')
  ballMaterial = new CANNON.Material('ballMaterial')
  playerMaterial = new CANNON.Material('playerMaterial')

  wallContactMaterial = new CANNON.ContactMaterial(ballMaterial, wallMaterial)
  wallContactMaterial.friction = 0
  wallContactMaterial.restitution = 1

  playerContactMaterial = new CANNON.ContactMaterial(playerMaterial,wallMaterial)
  playerContactMaterial.friction = 0
  playerContactMaterial.restitution = 0.2

  ballContactMaterial = new CANNON.ContactMaterial(ballMaterial, ballMaterial)
  ballContactMaterial.friction = 0
  ballContactMaterial.restitution = 1

  world.addContactMaterial(ballContactMaterial)
  world.addContactMaterial(playerContactMaterial)
  world.addContactMaterial(wallContactMaterial)
  shape = new CANNON.Box(new CANNON.Vec3(1,1,1))


  mass = 100
  body = new CANNON.Body({
    mass: 1, material: playerMaterial
  })

  body.addShape(shape)
  body.angularVelocity.set(0,0,0)
  body.angularDamping = 0.2
  world.addBody(body)
  body.position.y = 0




  groundShape = new CANNON.Box(new CANNON.Vec3(30,30,10))
  groundBody = new CANNON.Body({ mass: 0, material: wallMaterial })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
  groundBody.position.set(0,0,0)
  groundBody.position.y = -20
  world.addBody(groundBody)

  ceilingShape = new CANNON.Box(new CANNON.Vec3(30,30,10))
  ceilingBody = new CANNON.Body({ mass: 0, material: wallMaterial })
  ceilingBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
  ceilingBody.addShape(ceilingShape)
  ceilingBody.position.set(0,0,0)
  ceilingBody.position.y = 20
  world.addBody(ceilingBody)

  leftWallShape = new CANNON.Box(new CANNON.Vec3(20,10,20))
  leftWallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
  leftWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
  leftWallBody.addShape(leftWallShape)
  leftWallBody.position.set(0,0,0)
  leftWallBody.position.z = -20
  world.addBody(leftWallBody)

  rightWallShape = new CANNON.Box(new CANNON.Vec3(20,10,20))
  rightWallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
  rightWallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
  rightWallBody.addShape(rightWallShape)
  rightWallBody.position.set(0,0,0)
  rightWallBody.position.z = 20
  world.addBody(rightWallBody)

  frontWallShape = new CANNON.Box(new CANNON.Vec3(20,10,20))
  frontWallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
  frontWallBody.addShape(frontWallShape)
  frontWallBody.position.set(0,0,0)
  frontWallBody.position.x = -40
  world.addBody(frontWallBody)

  backWallShape = new CANNON.Box(new CANNON.Vec3(20,10,20))
  backWallBody = new CANNON.Body({ mass: 0, material: wallMaterial })
  backWallBody.addShape(backWallShape)
  backWallBody.position.set(0,0,0)
  backWallBody.position.x = 40
  world.addBody(backWallBody)




  //console.log(world)
  //world.add(groundBody)


  scene = new THREE.Scene()
  //camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 )
  camera.position.x = -0.20861329770365564
  camera.position.y =  6.488600711758697
  camera.position.z = 42.37277465856009


  scene.add( camera )
  //lighting
  var Alight = new THREE.AmbientLight( 0x404040 ) // soft white light
  scene.add( Alight )
  const light = new THREE.DirectionalLight( 0xffffff )
  light.position.set( 40, 25, 10 )
  light.castShadow = true
  scene.add(light)


  //Objects
  geometry = new THREE.BoxGeometry( 2, 2, 2 )
  material =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
    transparent: false } )


  //BOX

  mesh = new THREE.Mesh( geometry, material )
  group = new THREE.Group()
  group.scale.set(4, 2, 2)


  setPlane('y',  Math.PI * 0.5, 0xff0000) //px
  setPlane('y', -Math.PI * 0.5, 0xff0000) //nx
  setPlane('x',  -Math.PI * 0.5, 0x00ff00) //ny
  setPlane('y',  0, 0x0000ff) //pz
  setPlane('y',  Math.PI, 0x0000ff)// nz

  function setPlane(axis, angle, color) {
    const planeGeom = new THREE.PlaneGeometry(10, 10, 10, 10)
    planeGeom.translate(0, 0, 5)
    switch (axis) {
      case 'y':
        planeGeom.rotateY(angle)
        break
      default:
        planeGeom.rotateX(angle)
    }
    const plane = new THREE.Mesh(planeGeom, new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide}))

    group.add(plane)
  }
  group.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
  const game = document.getElementById('game')
  scene.add( mesh, floor, group )
  renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth, window.innerHeight )
  game.appendChild( renderer.domElement )
  controls = new OrbitControls( camera, renderer.domElement )
}



function ballCreate(x,y){
  const materialBall = new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
    transparent: true } )

  const ballGeometry = new THREE.SphereGeometry(1, 32, 32)
  const ballMesh = new THREE.Mesh( ballGeometry, materialBall )
  ballMesh.name = 'ball'
  scene.add(ballMesh)
  ballMeshes.push(ballMesh)

  mass = 2, radius = 1


  ballShape = new CANNON.Sphere(radius)
  ballBody = new CANNON.Body({ mass: 1, material: ballMaterial })
  ballBody.addShape(ballShape)
  ballBody.linearDamping = 0
  world.addBody(ballBody)
  balls.push(ballBody)
  ballBody.position.set(x,y,0)
  ballBody.angularVelocity.y = 3
  ballBody.velocity.x = 10
  ballBody.velocity.z = -10
  //console.log(ballBody)
  ballBody.addEventListener('collide',function(e){
    // console.log(e)
    // console.log(e.body.position.y)
    if(playing){



      if(score > 0 && score <= 2){

      }

      if(score > 2 && score <= 4){

      }

      if(score > 4 ){

      }
    }
    if(e.contact.bi.material.name ==='playerMaterial' || e.contact.bj.material.name ==='playerMaterial')
      playing = false

  })

}
ballCreate(Math.floor(Math.random()*5), Math.floor(Math.random()*5))



const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )




function animate() {


  if(scoreboard && !playing){
    scoreboard.innerHTML = ' GAME OVER: R TO RESET'
  }
  //group.rotation.y +=0.01
  if(cannonDebugRenderer){
    cannonDebugRenderer.update()
  }
  if(scoreboard && playing){
    scoreboard.innerHTML ='SCORE: '+ score
  }

  controls.update()
  requestAnimationFrame( animate )
  updatePhysics()
  render()

}
function updatePhysics() {
  // Step the physics world
  world.step(timeStep)


  //console.log(mesh.position)
  // Copy coordinates from Cannon.js to Three.js
  mesh.position.copy(body.position)
  mesh.quaternion.copy(body.quaternion)
  // floor.quaternion.copy(groundBody.quaternion)
  // floor.quaternion.copy(groundBody.quaternion)
  for(var i=0; i<balls.length; i++){
    ballMeshes[i].position.copy(balls[i].position)
    ballMeshes[i].quaternion.copy(balls[i].quaternion)
  }
}
function render() {
  renderer.render( scene, camera )
}
