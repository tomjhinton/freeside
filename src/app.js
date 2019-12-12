const CANNON = require('cannon')
const THREE = require('three')
import './style.scss'
import './debug.js'
import 'bulma'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import '@fortawesome/fontawesome-free'
let ready = false
//sounds
import * as mm from '@magenta/music'

const musicRNN= new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn')
let player
const  twinkle = {
  notes: [
    {pitch: 60, startTime: 0.0, endTime: 0.5},
    {pitch: 60, startTime: 0.5, endTime: 1.0},
    {pitch: 67, startTime: 1.0, endTime: 1.5},
    {pitch: 67, startTime: 1.5, endTime: 2.0},
    {pitch: 69, startTime: 2.0, endTime: 2.5},
    {pitch: 69, startTime: 2.5, endTime: 3.0},
    {pitch: 67, startTime: 3.0, endTime: 4.0},
    {pitch: 65, startTime: 4.0, endTime: 4.5},
    {pitch: 65, startTime: 4.5, endTime: 5.0},
    {pitch: 64, startTime: 5.0, endTime: 5.5},
    {pitch: 64, startTime: 5.5, endTime: 6.0},
    {pitch: 62, startTime: 6.0, endTime: 6.5},
    {pitch: 62, startTime: 6.5, endTime: 7.0},
    {pitch: 60, startTime: 7.0, endTime: 8.0}
  ],
  totalTime: 8
}


const rnnSteps = 400
const rnnTemperature = 1.5



function generate(input){
  const qns = mm.sequences.quantizeNoteSequence(input, 2)
  musicRNN
    .continueSequence(qns, rnnSteps, rnnTemperature)
    .then((sample) => {

      for(let i=0;i<sample.notes.length;i++){
        if(i%2===0){
          sample.notes[i].isDrum = false
        }
      }




      player = new mm.Player(false, {
        run: () => {
          if(!ready){
            loading.classList.add('hide')
            initGame()
            animate()
          }
        },
        stop: () => {
          console.log('done')
          player.start(sample)
        }

      })

      player.start(sample)


    })
}
//generate(twinkle)
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
var world, body, shape, timeStep=1/60,
  camera, scene, renderer, geometry, material, mesh, groundBody, floor, groundShape, platform,   ballMaterial, ballContactMaterial, platCanArr = [], platThreeArr = [],  score = 0, playerMaterial, playerContactMaterial, wallMaterial, wallContactMaterial,  playing = true

let totalScore = 0
const scoreboard = document.getElementById('score')
scoreboard.innerHTML = 'SCORE: '+ (score +totalScore)
const loading = document.getElementById('loading')

let start = false
loading.addEventListener('click', function () {
  loading.innerHTML ='loading...'
  if(!start){
    start = true

    generate(twinkle)

  }
})


function initGame() {
  const sound = document.getElementById('sound')
  sound.innerHTML= 'please make the bleeping stop'

  sound.addEventListener('click', function (e) {
if(sound.innerHTML=== 'please make the bleeping stop'){
    sound.innerHTML= ''

    player.stop()
  }


  })

  ready= true
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
  scene.add( mesh, floor )
  renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth-250, window.innerHeight-200 )
  game.appendChild( renderer.domElement )


}





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

    body.position.z = 0
    world.gravity.y -= 5
    console.log(world.gravity)
  }


  if (keys[32]  ) {

    // up arrow or space
    //body.velocity.y +=1.4


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
      platThreeArr[i].position.x = i*2+ Math.sin(time) * 20
    }

    if(i%5===0 && i%2!==0 ){

      platThreeArr[i].position.y = i*2+( Math.sin(time) * 25) -20
    }
  }




  if(scoreboard && !playing){
    scoreboard.innerHTML = ' GAME OVER: R TO RESET'
  }

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
