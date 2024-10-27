// Import necessary modules

export default {
    base: '/vedant-tailor/Planets/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split Three.js and related packages into a separate chunk
            three: ['three', 'three/examples/jsm/loaders/GLTFLoader'],
            // Split other large vendor modules
            vendor: ['@react-three/fiber', '@react-three/drei'],
          },
          // Adjust the chunk size warning limit (in kB)
          chunkSizeWarningLimit: 1000,
        }
      },
      // Split chunks by size
      chunkSizeWarningLimit: 1000,
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split node_modules into separate chunks
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            // Split your models into a separate chunk
            if (id.includes('/models/')) {
              return 'models';
            }
          }
        }
      }
    }
  }
import * as THREE from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
const scene = new THREE.Scene();

// Create a camera, which determines what we'll see when we render the scene
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

// Throttle function
let lastWheelTime = 0
const throttleDelay = 2000
let scrollCount = 0

function throttledWheelHandler(event){
    
    const currentTime = Date.now();
    if (currentTime - lastWheelTime >= throttleDelay) {
    
       lastWheelTime = currentTime;
       const direction = event.deltaY > 0 ? "down" : "up";

       scrollCount = (scrollCount+1)%4
       const headings = document.querySelectorAll(".heading");
       gsap.to(headings,{
        duration: 1,
        y: `-=${100}%`,
        ease: "power1.inOut",
       })

       gsap.to(spheres.rotation,{
        duration: 1,
        y: `-=${Math.PI/2}%`,
        ease: "power1.inOut",
       })

       if (scrollCount === 0) {
        gsap.to(headings,{
            duration: 1,
            y: `0`,
            ease: "power1.inOut",
        })
       }
    }
   
}
// Add the throttled event listener
window.addEventListener('wheel', throttledWheelHandler);


// Create a renderer and set its size
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Load HDRI texture
const loader = new RGBELoader();
loader.load('./night.hdr', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});


const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const colors = [0x0077ff, 0x00ff77, 0x7700ff, 0xff7700];
let textures = ["./textures/csilla/color.png", "./textures/earth/map.jpg","./textures/venus/map.jpg", "./textures/volcanic/color.png" ];
const spheres = new THREE.Group();

// Create a big sphere and put stars texture on it
const bigSphereRadius = 50;
const bigSphereSegments = 64;
const bigSphereTextureLoader = new THREE.TextureLoader();
const bigSphereTexture = bigSphereTextureLoader.load('./textures/stars.jpg');
bigSphereTexture.colorSpace = THREE.SRGBColorSpace;
const bigSphereGeometry = new THREE.SphereGeometry(bigSphereRadius, bigSphereSegments, bigSphereSegments);
const bigSphereMaterial = new THREE.MeshStandardMaterial({
    map: bigSphereTexture,
    opacity: 0.3,
    side: THREE.BackSide
});
const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
scene.add(bigSphere);


// setInterval(() => {
//     gsap.to(spheres.rotation, {
//         y: `+=${Math.PI / 2}`,
//         duration: 2,
//         ease: 'expo.easeInOut',
//     });
// }, 5000);

const sphereMesh = [];

for (let i = 0; i < 4; i++) {
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshStandardMaterial({map: texture});
    const sphere = new THREE.Mesh(geometry, material);

    sphereMesh.push(sphere)
    
    const angle = (i/4) * Math.PI * 2 ;
    sphere.position.x = Math.cos(angle) * orbitRadius;
    sphere.position.z = Math.sin(angle) * orbitRadius;
    spheres.add(sphere);
}

// Add the group of spheres to the scene
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

// Add orbit controls to allow for camera movement

const clock = new THREE.Clock();

// Create an animation loop to render the scene
function animate() {
    requestAnimationFrame(animate);
    for (let i = 0; i < sphereMesh.length; i++) {
        const sphere = sphereMesh[i]
        sphere.rotation.y = clock.getElapsedTime() * 0.01;
    }
    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});
