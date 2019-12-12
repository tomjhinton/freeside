const CANNON = require('cannon')
const THREE = require('three')
import './style.scss'
import './debug.js'
import 'bulma'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


const keys =[]
document.body.addEventListener('keydown', function (e) {
  e.preventDefault()


  if(e.keyCode===82){
  //reset

    score = 0
    totalScore = 0
    body.position.x = 0
    body.position.y = 0
    body.position.z = 0
    body.velocity.z = 0
    body.velocity.x = 0
    body.velocity.y = 0
    mesh.position.y =  0
    body.angularVelocity.x =  0
    body.angularVelocity.z =  0
    body.angularVelocity.y =  0
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    console.log(body)
    playing = true
    scoreboard.innerHTML = 'SCORE: '+ (score +totalScore)

  }

  keys[e.keyCode] = true
})

document.body.addEventListener('keyup', function (e) {
  keys[e.keyCode] = false
})


//CANNNON && THREE
// Create a
var world, mass, body, shape, timeStep=1/60,
camera, scene, renderer, geometry, material, mesh, groundBody, floor, groundShape, platform, physicsMaterial, ballShape, ballBody, radius, balls=[], ballMeshes=[], group, controls,   ballMaterial, ballContactMaterial, platCanArr = [], platThreeArr = [], physicsContactMaterial, score = 0, playerMaterial, playerContactMaterial, wallMaterial, wallContactMaterial,  playing = true
initGame()
animate()
let totalScore = 0
const scoreboard = document.getElementById('score')
scoreboard.innerHTML = 'SCORE: '+ (score +totalScore)



function initGame() {
  world = new CANNON.World()
  world.gravity.set(0,-20,0)
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
  playerContactMaterial.restitution = 1.3

  ballContactMaterial = new CANNON.ContactMaterial(ballMaterial, ballMaterial)
  ballContactMaterial.friction = 0
  ballContactMaterial.restitution = 1

  world.addContactMaterial(ballContactMaterial)
  world.addContactMaterial(playerContactMaterial)
  world.addContactMaterial(wallContactMaterial)
  shape = new CANNON.Box(new CANNON.Vec3(1,1,1))


  mass = 100
  body = new CANNON.Body({
    mass: 10, material: playerMaterial
  })

  body.addShape(shape)
  body.angularVelocity.set(0,0,0)
  body.angularDamping = 0.5
  world.addBody(body)
  body.position.y = 0




  scene = new THREE.Scene()
  //camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 )
  camera.position.x = -0.20861329770365564
  camera.position.y =  8.488600711758697
  camera.position.z = 62.37277465856009



  scene.add( camera )
  //lighting
  var Alight = new THREE.AmbientLight( 0x404040 ) // soft white light
  scene.add( Alight )
  const light = new THREE.DirectionalLight( 0xffffff )
  light.position.set( 0, 200, -110 )
  light.castShadow = true
  scene.add(light)


  //Objects
  geometry = new THREE.BoxGeometry( 2, 2, 2 )
  material =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
    transparent: false } )


  //BOX

  mesh = new THREE.Mesh( geometry, material )



function createPlatform(x,y,z){
    groundShape = new CANNON.Box(new CANNON.Vec3(10,10,1))
    groundBody = new CANNON.Body({ mass: 0, material: wallMaterial })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    groundBody.position.set(0,0,0)
    groundBody.position.x = x
    groundBody.position.y = y
    groundBody.position.z = z

    world.addBody(groundBody)
    platCanArr.push(groundBody)


    platform = new THREE.BoxGeometry( 20, 20, 2 )
    material =  new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 0.8,
      transparent: false } )

    const platMesh = new THREE.Mesh( platform, material )

    platMesh.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    platMesh.position.x = x
    platMesh.position.y = y
    platMesh.position.z = z

    scene.add(platMesh)
    platThreeArr.push(platMesh)
  }


  createPlatform(0,-20,0)

  for(let i=1;i<25;i ++ ){
    createPlatform(Math.random()*80,-20,-40*i)

  }


  const game = document.getElementById('game')
  scene.add( mesh, floor, group )
  renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth-250, window.innerHeight-200 )
  game.appendChild( renderer.domElement )
  //controls = new OrbitControls( camera, renderer.domElement )
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
//ballCreate(Math.floor(Math.random()*5), Math.floor(Math.random()*5))



const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )



let time = 0
function animate() {
  score = platThreeArr.filter(x=> x.position.z > mesh.position.z).length
  time+=0.01
  camera.position.x = mesh.position.x+ 0.20861329770365564
  camera.position.y = mesh.position.y + 9.488600711758697
  camera.position.z = mesh.position.z+ 52.37277465856009

  if(platThreeArr.filter(x=> x.position.y < mesh.position.y).length ===0){

    playing = false
  }

  if(platThreeArr.filter(x=> x.position.z > mesh.position.z).length === platThreeArr.length && playing){
    totalScore += platThreeArr.length
    body.position.x = 0
    body.position.y = 0
    body.position.z = 0
    world.gravity.y -= 5
    console.log(world.gravity)
  }


  if (keys[32]  ) {

    // up arrow or space
    body.velocity.y +=1.4


  }if (keys[39]) {
    // right arrow
    body.velocity.x +=0.4

  }
  if (keys[37]) {         // left arrow
    body.velocity.x -=0.4
  }
  if (keys[38]) {         // left arrow
    body.velocity.z -=0.4
  }
  if (keys[40]) {         // left arrow
    body.velocity.z +=0.4
  }

  for(let i=1;i<platThreeArr.length;i++){
    if(i%2===0){
      platThreeArr[i].rotation.z += 0.01

    }

    if(i%3===0 && i%2!==0 ){
      platThreeArr[i].rotation.y += 0.01
      platThreeArr[i].position.x = i*10+ Math.sin(time) * 20
    }
  }


  if(scoreboard && !playing){
    scoreboard.innerHTML = ' GAME OVER: R TO RESET'
  }
  //group.rotation.y +=0.01
  if(cannonDebugRenderer){

    //cannonDebugRenderer.update()
  }
  if(scoreboard && playing){
    scoreboard.innerHTML = 'SCORE: '+ (score +totalScore)
  }

  //controls.update()
  requestAnimationFrame( animate )
  updatePhysics()
  render()

}
function updatePhysics() {
  // Step the physics world
  world.step(timeStep)
  for(var i=0; i<platCanArr.length; i++){
    platCanArr[i].position.copy(platThreeArr[i].position)
    platCanArr[i].quaternion.copy(platThreeArr[i].quaternion)
  }

  mesh.position.copy(body.position)
  mesh.quaternion.copy(body.quaternion)


}
function render() {
  renderer.render( scene, camera )
}
