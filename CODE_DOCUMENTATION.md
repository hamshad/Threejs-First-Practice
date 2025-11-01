# Code Documentation - Three.js 3D Model Viewer

## Overview
This application loads and displays 3D models (GLTF/GLB format) using Three.js with interactive controls for viewing and lighting adjustments.

---

## 📁 File Structure

```
Blender_To_ThreeJS-main/
├── index.html              # Main HTML with UI controls
├── app.js                  # Express server setup
├── package.json            # Dependencies
├── public/
│   ├── models/            # 3D model files (scene.gltf, scene.glb)
│   └── src/
│       ├── main.js        # Main Three.js application
│       ├── style.css      # UI styling
│       └── Helpers/
│           └── ModelHelper.js  # Model loading utilities
```

---

## 🔧 Key Features Implemented

### 1. **Model Format Switching (GLTF vs GLB)**
- **Location**: `public/src/main.js` - `loadModel()` function
- **What it does**: Allows switching between text-based GLTF and binary GLB formats
- **How it works**:
  - Removes previous model from scene
  - Loads new model using `LoadGLTFByPath()`
  - Updates statistics panel
  - Maintains camera and controls

### 2. **OrbitControls (Interactive Camera)**
- **Location**: `public/src/main.js` - `setupControls()` function
- **What it does**: Enables mouse/touch interaction with the 3D scene
- **Controls**:
  - Left drag: Rotate camera around model
  - Scroll: Zoom in/out
  - Right drag: Pan camera
- **Key settings**:
  - `enableDamping`: Smooth inertia effect
  - `dampingFactor`: Controls smoothness (0.05)
  - `minDistance/maxDistance`: Zoom limits

### 3. **Auto-Centering Algorithm**
- **Location**: `public/src/main.js` - `centerModel()` function
- **What it does**: Automatically centers the model and positions camera optimally
- **How it works**:
  1. Calculates bounding box of all meshes
  2. Finds the center point
  3. Moves model to origin (0,0,0)
  4. Calculates optimal camera distance based on model size
  5. Positions camera at an angle for better perspective

### 4. **Performance Statistics**
- **Location**: `public/src/Helpers/ModelHelper.js`
- **Metrics tracked**:
  - **Load Time**: Time taken to load the model (milliseconds)
  - **File Size**: Size of model file (kilobytes)
  - **Vertices**: Total vertex count across all meshes
  - **Triangles**: Total triangle/face count
  - **Meshes**: Number of mesh objects in the model
- **Purpose**: Compare GLTF vs GLB performance

### 5. **Lighting Controls**
- **Location**: `public/src/main.js` - `setupLightingControls()` function
- **Controls provided**:
  - **Ambient Light**: 
    - Intensity slider (0-2)
    - Color picker
  - **Directional Light**:
    - Intensity slider (0-3)
    - Color picker
    - Position sliders (X, Y, Z: -10 to 10)
  - **Reset Button**: Restores default lighting

---

## 🔄 Application Flow

```
1. Page Load
   ↓
2. Initialize Three.js Scene
   ↓
3. Set up default lighting (ambient + directional)
   ↓
4. Set up UI event listeners
   ↓
5. Load initial GLTF model
   ↓
6. Model loads → retrieve/create camera
   ↓
7. Center model in viewport
   ↓
8. Set up OrbitControls
   ↓
9. Update statistics panel
   ↓
10. Start animation loop (60fps)
```

---

## 🎨 UI Components

### Control Panel (`#controls-panel`)
- **Position**: Fixed top-right corner
- **Style**: Semi-transparent black with glassmorphism blur
- **Scrollable**: Yes (custom blue scrollbar)

### Format Switch Buttons
- **GLTF**: Text-based JSON format
- **GLB**: Binary format (typically smaller and faster)
- **Active state**: Blue highlight with glow effect

### Statistics Display
- **Layout**: Two-column comparison (GLTF vs GLB)
- **Updates**: Real-time after each model load

### Lighting Panel
- **Sections**: Ambient Light, Directional Light
- **Inputs**: Range sliders, color pickers
- **Feedback**: Real-time value display

---

## 🔑 Key Functions Explained

### `loadModel(format)`
**Purpose**: Load a 3D model in specified format  
**Parameters**: `'gltf'` or `'glb'`  
**Process**:
1. Remove previous model
2. Call `LoadGLTFByPath()` with format
3. Store reference to loaded model
4. Set up camera
5. Center model
6. Update UI stats

### `setupUI()`
**Purpose**: Initialize all UI event listeners  
**Sets up**:
- Format button click handlers
- Lighting control change handlers
- Reset button functionality

### `retrieveListOfCameras(scene)`
**Purpose**: Find cameras in model or create default  
**Logic**:
- Searches scene for camera objects
- If none found: creates PerspectiveCamera
- Updates aspect ratio
- Starts animation loop

### `centerModel(scene)`
**Purpose**: Position model at origin and optimize camera  
**Algorithm**:
1. Calculate bounding box of all meshes
2. Get center point and dimensions
3. Move model to center (0,0,0)
4. Calculate camera distance based on model size
5. Position camera at optimal viewing angle

### `setupControls()`
**Purpose**: Enable interactive camera manipulation  
**Configuration**:
- Damping for smooth movement
- Zoom limits
- Rotation constraints
- Target point (model center)

### `animate()`
**Purpose**: Render loop running at ~60fps  
**Each frame**:
1. Request next animation frame
2. Update OrbitControls (for damping)
3. Render scene from camera

---

## 📊 Statistics Collection

### ModelHelper.js - LoadGLTFByPath()
**Collects**:
- Start time using `performance.now()`
- File size from loader progress callback
- Geometry data by traversing model:
  - Counts meshes
  - Sums vertices from position attributes
  - Calculates triangles from index/position data
- End time to calculate load duration

**Storage**: `modelStats` object with separate entries for 'gltf' and 'glb'

---

## 🎮 User Interactions

### Mouse Controls (via OrbitControls)
- **Left Click + Drag**: Rotate around model
- **Scroll Wheel**: Zoom in/out
- **Right Click + Drag**: Pan camera

### UI Controls
- **Format Buttons**: Switch between GLTF/GLB
- **Intensity Sliders**: Adjust light brightness (real-time)
- **Color Pickers**: Change light colors (real-time)
- **Position Sliders**: Move directional light (real-time)
- **Reset Button**: Restore default lighting values

---

## 🔧 Technical Details

### Three.js Setup
- **Renderer**: WebGLRenderer with antialiasing
- **Color Space**: SRGB (for accurate colors)
- **Shadow Map**: Enabled
- **Pixel Ratio**: Matches device for sharp rendering

### Import Map
```javascript
{
  "three": "./node_modules/three/build/three.module.js",
  "three/examples/": "./node_modules/three/examples/"
}
```
**Purpose**: Maps module names to file paths for browser imports

### Responsive Design
- Window resize listener updates:
  - Camera aspect ratio
  - Renderer size
- Prevents distortion on window resize

---

## 🚀 Performance Optimizations

1. **Damping**: Smooth camera movements without heavy calculations
2. **RequestAnimationFrame**: Browser-optimized rendering loop
3. **Lazy Controls**: OrbitControls only created once
4. **Efficient Traversal**: Single pass to collect statistics
5. **Binary GLB**: Faster loading than text-based GLTF

---

## 🎓 Learning Points

### Why GLB is Usually Faster
- **Binary format**: Parsed faster than JSON
- **Embedded assets**: No separate file requests
- **Smaller size**: Better compression

### Why GLTF Might Be Preferred
- **Human-readable**: Easy to debug/edit
- **Version control**: Git-friendly text format
- **Modular**: External textures/buffers

### Camera Math
```javascript
cameraZ = maxDim / 2 / Math.tan(fov / 2)
```
**Explanation**: Calculates distance needed to fit object in view based on field of view

---

## 🐛 Error Handling

1. **Missing Camera**: Creates default PerspectiveCamera
2. **Load Failure**: Caught by promise rejection
3. **Empty Model Group**: Checks before centering
4. **Controls Check**: Verifies existence before updating

---

## 💡 Tips for Developers

1. **Adding New Lights**: Update both scene creation and reset button
2. **Changing Model Path**: Edit `scenePath` in ModelHelper.js
3. **UI Customization**: Modify CSS variables and colors
4. **Performance Monitoring**: Check console for load times and model stats
5. **Browser Compatibility**: Test import maps support (may need polyfill)

---

## 📝 Dependencies

- **three**: ^0.153.0 - 3D graphics library
- **express**: ^4.18.2 - Web server

---

## 🎯 Future Enhancements

Possible additions:
- Multiple light support
- Material editor
- Animation playback controls
- Screenshot/export functionality
- VR mode support
- Wireframe toggle
- Measurement tools

---

**Last Updated**: November 2025  
**Author**: Documentation generated with comprehensive inline comments
