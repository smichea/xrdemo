import { VRButton } from 'three/addons/webxr/VRButton.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { OBJLoader } from 'three/addons/loaders/OBJLoader'
import { MTLLoader } from 'three/addons/loaders/MTLLoader'
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, -5 );
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

const light = new THREE.PointLight()
light.position.set(2.5, 7.5, 15)
scene.add(light)

//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const points = [];
points.push( new THREE.Vector3( 0, 0, 0 ) );
points.push( new THREE.Vector3( 0, 0, 2 ) );
points.push( new THREE.Vector3( 0, 0, 0 ) );
points.push( new THREE.Vector3( 0, 2, 0 ) );
points.push( new THREE.Vector3( 0, 0, 0 ) );
points.push( new THREE.Vector3( 2, 0, 0 ) );


const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

scene.add( line );

const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ),  new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
scene.add( cube );

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const mtlLoader = new MTLLoader()
mtlLoader.load(
    'model/3DModel.mtl',
    (materials) => {
        materials.preload()
        console.log(materials)
         const objLoader = new OBJLoader()
         objLoader.setMaterials(materials)
         objLoader.load(
             'model/3DModel.obj',
             (object) => {
                 scene.add(object)
             },
             (xhr) => {
                 console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
             },
             (error) => {
                 console.log('An error happened')
             }
         )
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log('An error happened')
    }
)

document.body.appendChild( VRButton.createButton( renderer ) );

renderer.xr.enabled = true;

renderer.setAnimationLoop( function () {
    controls.update();
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render( scene, camera );
} );