import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 10 );
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

const points = [];
points.push( new THREE.Vector3( - 2, 0, 0 ) );
points.push( new THREE.Vector3( 0, 2, 0 ) );
points.push( new THREE.Vector3( 2, 0, 0 ) );

const cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ),  new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
scene.add( cube );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

scene.add( line );

document.body.appendChild( VRButton.createButton( renderer ) );

renderer.xr.enabled = true;

renderer.setAnimationLoop( function () {

	renderer.render( scene, camera );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

} );