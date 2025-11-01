import * as THREE from 'three'
// Import the helper function to load GLTF/GLB models and get statistics
import { LoadGLTFByPath, getModelStats } from './Helpers/ModelHelper.js'
// Import OrbitControls to enable mouse-based camera interaction (drag to rotate, scroll to zoom)
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
// Ambient light provides soft, non-directional lighting from all angles
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Directional light simulates sunlight - provides shadows and highlights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

let cameraList = [];

let camera;
let controls; // OrbitControls instance for interactive camera movement
let currentFormat = 'gltf'; // Track which format is currently loaded ('gltf' or 'glb')
let loadedModel = null; // Reference to the currently loaded model for easy removal

// Initialize UI event listeners for buttons and sliders
setupUI();

// Load the initial GLTF model on page load
loadModel('gltf');

/**
 * Load a 3D model in either GLTF or GLB format
 * @param {string} format - Either 'gltf' or 'glb'
 * 
 * This function:
 * 1. Removes the previously loaded model from the scene
 * 2. Loads the new model using the specified format
 * 3. Sets up the camera and centers the model
 * 4. Updates the statistics panel with load time and model info
 */
function loadModel(format) {
  currentFormat = format;
  
  // Remove previous model if exists to prevent duplicates in the scene
  if (loadedModel) {
    scene.remove(loadedModel);
    loadedModel = null;
  }
  
  // Load new model using the helper function from ModelHelper.js
  LoadGLTFByPath(scene, format)
    .then((result) => {
      // Store reference to the loaded model for future removal
      loadedModel = result.gltf.scene;
      
      // Set up or retrieve camera from the model
      retrieveListOfCameras(scene);
      
      // Center the model in the viewport for better viewing
      centerModel(scene);
      
      // Set up orbit controls if not already initialized
      if (!controls) {
        setupControls();
      }
      
      // Update the UI statistics panel with load time and geometry info
      updateStats();
    })
    .catch((error) => {
      console.error('Error loading model:', error);
    });
}

/**
 * Set up all UI event listeners for format switching and lighting controls
 * Called once on page load to initialize interactive elements
 */
function setupUI() {
  // Get references to the format switching buttons
  const gltfBtn = document.getElementById('gltf-btn');
  const glbBtn = document.getElementById('glb-btn');
  
  // GLTF button click handler - loads text-based GLTF format
  gltfBtn.addEventListener('click', () => {
    if (currentFormat !== 'gltf') {
      loadModel('gltf');
      // Update button visual states
      gltfBtn.classList.add('active');
      glbBtn.classList.remove('active');
    }
  });
  
  // GLB button click handler - loads binary GLB format
  glbBtn.addEventListener('click', () => {
    if (currentFormat !== 'glb') {
      loadModel('glb');
      // Update button visual states
      glbBtn.classList.add('active');
      gltfBtn.classList.remove('active');
    }
  });
  
  // Initialize all lighting control sliders and inputs
  setupLightingControls();
}

/**
 * Set up all lighting control event listeners
 * Handles real-time updates to ambient and directional lights based on user input
 */
function setupLightingControls() {
  // === AMBIENT LIGHT CONTROLS ===
  
  // Ambient light intensity slider (0.0 to 2.0)
  const ambientIntensity = document.getElementById('ambient-intensity');
  const ambientIntensityValue = document.getElementById('ambient-intensity-value');
  ambientIntensity.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    ambientLight.intensity = value; // Update the Three.js light object
    ambientIntensityValue.textContent = value.toFixed(1); // Update displayed value
  });
  
  // Ambient light color picker
  const ambientColor = document.getElementById('ambient-color');
  ambientColor.addEventListener('input', (e) => {
    // Convert hex color from input to Three.js color
    ambientLight.color.setStyle(e.target.value);
  });
  
  // === DIRECTIONAL LIGHT CONTROLS ===
  
  // Directional light intensity slider (0.0 to 3.0)
  const directionalIntensity = document.getElementById('directional-intensity');
  const directionalIntensityValue = document.getElementById('directional-intensity-value');
  directionalIntensity.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    directionalLight.intensity = value; // Update the Three.js light object
    directionalIntensityValue.textContent = value.toFixed(1); // Update displayed value
  });
  
  // Directional light color picker
  const directionalColor = document.getElementById('directional-color');
  directionalColor.addEventListener('input', (e) => {
    // Convert hex color from input to Three.js color
    directionalLight.color.setStyle(e.target.value);
  });
  
  // === DIRECTIONAL LIGHT POSITION CONTROLS ===
  // These control where the light is positioned in 3D space (X, Y, Z coordinates)
  
  const lightPosX = document.getElementById('light-pos-x');
  const lightPosY = document.getElementById('light-pos-y');
  const lightPosZ = document.getElementById('light-pos-z');
  const lightPosXValue = document.getElementById('light-pos-x-value');
  const lightPosYValue = document.getElementById('light-pos-y-value');
  const lightPosZValue = document.getElementById('light-pos-z-value');
  
  // X-axis position (left/right)
  lightPosX.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    directionalLight.position.x = value;
    lightPosXValue.textContent = value.toFixed(1);
  });
  
  // Y-axis position (up/down)
  lightPosY.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    directionalLight.position.y = value;
    lightPosYValue.textContent = value.toFixed(1);
  });
  
  // Z-axis position (forward/back)
  lightPosZ.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    directionalLight.position.z = value;
    lightPosZValue.textContent = value.toFixed(1);
  });
  
  // === RESET BUTTON ===
  // Restores all lighting values to their defaults
  const resetBtn = document.getElementById('reset-lighting');
  resetBtn.addEventListener('click', () => {
    // Reset ambient light to defaults
    ambientLight.intensity = 0.5;
    ambientLight.color.setHex(0xffffff); // White color
    ambientIntensity.value = 0.5;
    ambientIntensityValue.textContent = '0.5';
    ambientColor.value = '#ffffff';
    
    // Reset directional light to defaults
    directionalLight.intensity = 1.0;
    directionalLight.color.setHex(0xffffff); // White color
    directionalLight.position.set(5, 5, 5); // Reset position
    directionalIntensity.value = 1.0;
    directionalIntensityValue.textContent = '1.0';
    directionalColor.value = '#ffffff';
    
    // Reset position sliders
    lightPosX.value = 5;
    lightPosY.value = 5;
    lightPosZ.value = 5;
    lightPosXValue.textContent = '5.0';
    lightPosYValue.textContent = '5.0';
    lightPosZValue.textContent = '5.0';
    
    console.log('Lighting reset to default values');
  });
}

/**
 * Update the statistics panel with current model information
 * Retrieves stats from ModelHelper and displays them in the UI
 */
function updateStats() {
  // Get the statistics object that contains data for both formats
  const stats = getModelStats();
  
  // Update GLTF stats (if this format has been loaded)
  if (stats.gltf.loadTime > 0) {
    document.getElementById('gltf-loadtime').textContent = stats.gltf.loadTime + ' ms';
    document.getElementById('gltf-filesize').textContent = stats.gltf.fileSize + ' KB';
    document.getElementById('gltf-vertices').textContent = stats.gltf.vertices.toLocaleString();
    document.getElementById('gltf-triangles').textContent = stats.gltf.triangles.toLocaleString();
    document.getElementById('gltf-meshes').textContent = stats.gltf.meshes;
  }
  
  // Update GLB stats (if this format has been loaded)
  if (stats.glb.loadTime > 0) {
    document.getElementById('glb-loadtime').textContent = stats.glb.loadTime + ' ms';
    document.getElementById('glb-filesize').textContent = stats.glb.fileSize + ' KB';
    document.getElementById('glb-vertices').textContent = stats.glb.vertices.toLocaleString();
    document.getElementById('glb-triangles').textContent = stats.glb.triangles.toLocaleString();
    document.getElementById('glb-meshes').textContent = stats.glb.meshes;
  }
}

/**
 * Retrieve cameras from the loaded model or create a default one
 * @param {THREE.Scene} scene - The Three.js scene object
 * 
 * Searches the scene for camera objects. If none found, creates a default
 * perspective camera positioned to view the model
 */
//retrieve list of all cameras
function retrieveListOfCameras(scene){
  // Traverse the entire scene graph looking for camera objects
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });

  // If no camera found in the scene, create a default one
  if (cameraList.length === 0) {
    console.log('No camera found in scene, creating default camera');
    // Create a perspective camera with 75° field of view
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5; // Position camera 5 units back from origin
    scene.add(camera);
  } else {
    // Use the first camera found in the imported model
    camera = cameraList[0];
  }

  // Update camera aspect ratio to match window dimensions
  updateCameraAspect(camera);

  // Start the animation loop after the model and cameras are loaded
  animate();
}

/**
 * Center the model in the viewport
 * @param {THREE.Scene} scene - The Three.js scene containing the model
 * 
 * This function:
 * 1. Calculates the bounding box of all meshes
 * 2. Moves the model to center it at the origin (0,0,0)
 * 3. Positions the camera at an optimal distance to view the entire model
 */
function centerModel(scene) {
  // Create a bounding box to calculate model dimensions
  const box = new THREE.Box3();
  
  // Calculate bounding box of all mesh objects (ignoring lights and cameras)
  scene.traverse(function (object) {
    if (object.isMesh) {
      box.expandByObject(object);
    }
  });
  
  // Get the center point and size of the bounding box
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  // Find the model's parent group to move it as a whole unit
  let modelGroup = null;
  scene.traverse(function (object) {
    if (object.isGroup && object !== scene && object.children.length > 0) {
      modelGroup = object;
    }
  });
  
  // Move the model group to center it at the origin (0, 0, 0)
  if (modelGroup) {
    modelGroup.position.sub(center); // Subtract center offset to reposition model
  }
  
  // Calculate optimal camera distance to view the entire model
  const maxDim = Math.max(size.x, size.y, size.z); // Get largest dimension
  const fov = camera.fov * (Math.PI / 180); // Convert field of view to radians
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)); // Calculate distance
  cameraZ *= 2; // Add padding multiplier to ensure entire model is visible
  
  // Position camera at an angle for better perspective (not directly facing one axis)
  camera.position.set(cameraZ * 0.7, cameraZ * 0.5, cameraZ * 0.7);
  camera.lookAt(0, 0, 0); // Point camera at the origin where model is centered
  camera.updateProjectionMatrix(); // Update camera projection matrix
  
  console.log('Model centered. Size:', size, 'Camera position:', camera.position);
}

/**
 * Set up OrbitControls for interactive camera manipulation
 * Enables user to rotate, zoom, and pan the camera around the model
 */
function setupControls() {
  // Create OrbitControls attached to our camera and canvas
  controls = new OrbitControls(camera, renderer.domElement);
  
  // Enable damping (inertia) for smoother camera movements
  controls.enableDamping = true;
  controls.dampingFactor = 0.05; // Lower = more damping/smoother
  
  // Disable panning in screen space (keeps panning relative to world)
  controls.screenSpacePanning = false;
  
  // Set zoom limits
  controls.minDistance = 1; // Closest zoom
  controls.maxDistance = 500; // Farthest zoom
  
  // Allow full rotation around the model (no angle restrictions)
  controls.maxPolarAngle = Math.PI;
  
  // Set the point the camera orbits around (model center)
  controls.target.set(0, 0, 0);
  
  // Apply initial control settings
  controls.update();
  
  console.log('OrbitControls enabled: Drag to rotate, scroll to zoom');
}

/**
 * Update camera aspect ratio to match window dimensions
 * @param {THREE.Camera} camera - The camera to update
 * 
 * Prevents distortion by matching the camera's aspect ratio to the viewport
 */
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height; // Update aspect ratio
  camera.updateProjectionMatrix(); // Apply the change
}

/**
 * Animation loop - runs once per frame
 * This function is called recursively to continuously render the scene
 */
function animate() {
  // Request the next frame (creates ~60fps loop)
  requestAnimationFrame(animate);

  // Update OrbitControls for smooth damping effect
  if (controls) {
    controls.update();
  }

  // Render the scene from the camera's perspective
  renderer.render(scene, camera);
}

/**
 * Handle window resize events
 * Updates camera and renderer to match new window dimensions
 */
window.addEventListener('resize', () => {
  // Update camera aspect ratio for new window size
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer size to fill the new window dimensions
  renderer.setSize(window.innerWidth, window.innerHeight);
});




    