import * as THREE from 'three'
import { LoadGLTFByPath } from './Helpers/ModelHelper.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Renderer does the job of rendering the graphics
let renderer = new THREE.WebGLRenderer({

	//Defines the canvas component in the DOM that will be used
	canvas: document.querySelector('#background'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

//set up the renderer with the default settings for threejs.org/editor - revision r153
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights  = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available. 
renderer.outputColorSpace = THREE.SRGBColorSpace 

const scene = new THREE.Scene();

// Add some default lighting in case the model doesn't have any
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

let cameraList = [];

let camera;
let controls;

// Load the GLTF model
LoadGLTFByPath(scene)
  .then(() => {
    retrieveListOfCameras(scene);
    centerModel(scene);
    setupControls();
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
  });

//retrieve list of all cameras
function retrieveListOfCameras(scene){
  // Get a list of all cameras in the scene
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });

  // If no camera found in the scene, create a default one
  if (cameraList.length === 0) {
    console.log('No camera found in scene, creating default camera');
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    scene.add(camera);
  } else {
    //Set the camera to the first value in the list of cameras
    camera = cameraList[0];
  }

  updateCameraAspect(camera);

  // Start the animation loop after the model and cameras are loaded
  animate();
}

// Center the model in the scene
function centerModel(scene) {
  const box = new THREE.Box3();
  
  // Calculate bounding box of all objects in the scene (excluding lights and cameras)
  scene.traverse(function (object) {
    if (object.isMesh) {
      box.expandByObject(object);
    }
  });
  
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  // Get the actual model group (not the whole scene)
  let modelGroup = null;
  scene.traverse(function (object) {
    if (object.isGroup && object !== scene && object.children.length > 0) {
      modelGroup = object;
    }
  });
  
  // Move the model group to center it at origin
  if (modelGroup) {
    modelGroup.position.sub(center);
  }
  
  // Position camera to view the entire model
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ *= 2; // Add more padding to see the whole model
  
  camera.position.set(cameraZ * 0.7, cameraZ * 0.5, cameraZ * 0.7);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  
  console.log('Model centered. Size:', size, 'Camera position:', camera.position);
}

// Setup orbit controls for interaction
function setupControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth camera movements
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI; // Allow full rotation
  controls.target.set(0, 0, 0); // Look at the center
  controls.update();
  console.log('OrbitControls enabled: Drag to rotate, scroll to zoom');
}

// Set the camera aspect ratio to match the browser window dimensions
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);

  // Update controls for smooth damping
  if (controls) {
    controls.update();
  }

  renderer.render(scene, camera);
};

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});




    