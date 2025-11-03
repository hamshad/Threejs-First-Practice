import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Track which format is currently loaded ('gltf' or 'glb')
let currentFormat = 'gltf';

// Performance tracking - when did loading start
let loadStartTime = 0;

// Store statistics for both formats to enable comparison
// Statistics include: loadTime, fileSize, vertices, triangles, meshes
let modelStats = {
  gltf: { loadTime: 0, fileSize: 0, vertices: 0, triangles: 0, meshes: 0 },
  glb: { loadTime: 0, fileSize: 0, vertices: 0, triangles: 0, meshes: 0 }
};

/**
 * Load a GLTF or GLB model and add it to the scene
 * @param {THREE.Scene} scene - The Three.js scene to add the model to
 * @param {string} format - Either 'gltf' or 'glb'
 * @returns {Promise} - Resolves with the loaded model and its statistics
 * 
 * This function:
 * 1. Loads the model file using GLTFLoader
 * 2. Calculates performance metrics (load time, file size)
 * 3. Analyzes model geometry (vertices, triangles, meshes)
 * 4. Stores statistics for comparison between formats
 */
export const LoadGLTFByPath = (scene, format = 'gltf') => {
  currentFormat = format;

  // Determine which file to load based on format
  const scenePath = format === 'gltf' ? '/public/models/scene.gltf' : '/public/models/scene-2.glb';

  return new Promise((resolve, reject) => {
    // Record start time for performance measurement
    loadStartTime = performance.now();

    // Create a loader instance
    const loader = new GLTFLoader();

    // Load the GLTF/GLB file
    loader.load(scenePath, (gltf) => {
      // Calculate how long the load took
      const loadTime = performance.now() - loadStartTime;

      // Initialize counters for model statistics
      let vertices = 0;
      let triangles = 0;
      let meshes = 0;

      // Traverse the loaded model to gather geometry statistics
      gltf.scene.traverse((object) => {
        if (object.isMesh) {
          meshes++; // Count number of mesh objects

          if (object.geometry) {
            // Count vertices from position attribute
            const positionAttribute = object.geometry.attributes.position;
            if (positionAttribute) {
              vertices += positionAttribute.count;
            }

            // Count triangles from index buffer or position count
            if (object.geometry.index) {
              // Indexed geometry: 3 indices per triangle
              triangles += object.geometry.index.count / 3;
            } else if (positionAttribute) {
              // Non-indexed geometry: 3 vertices per triangle
              triangles += positionAttribute.count / 3;
            }
          }
        }
      });

      // Store statistics for this format
      modelStats[format] = {
        loadTime: loadTime.toFixed(2), // Round to 2 decimal places
        vertices: vertices,
        triangles: Math.floor(triangles), // Round down to integer
        meshes: meshes
      };

      // Add the loaded model to the scene
      scene.add(gltf.scene);

      // Resolve promise with model and stats
      resolve({ gltf, stats: modelStats[format] });
    },
      (progress) => {
        // Progress callback - track file size during download
        if (progress.total > 0) {
          // Convert bytes to kilobytes
          modelStats[format].fileSize = (progress.total / 1024).toFixed(2);
        }
      },
      (error) => {
        // Error callback - reject promise if loading fails
        reject(error);
      });
  });
};

/**
 * Get statistics for both model formats
 * @returns {Object} - Object containing stats for both 'gltf' and 'glb' formats
 */
export const getModelStats = () => modelStats;

/**
 * Get the currently loaded format
 * @returns {string} - Either 'gltf' or 'glb'
 */
export const getCurrentFormat = () => currentFormat;
