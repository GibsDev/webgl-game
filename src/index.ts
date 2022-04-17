import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import FPS from './fps';
import Debug from './debug';

const mouse = new THREE.Vector2(-1, -1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
document.body.style.width = '100%';
document.body.appendChild(canvas);
document.body.appendChild(renderer.domElement);

const deltaDebug = new Debug();
const fps = new FPS();
document.body.appendChild(deltaDebug.dom);

const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(hemi);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const m_solidGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const m_basic = new THREE.MeshLambertMaterial({ color: 0x00cc00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const raycaster = new THREE.Raycaster();

let face: THREE.Mesh = new THREE.Mesh();

const clock = new THREE.Clock();
let delta = 0, frames = 0, beginTime = Date.now();

renderer.setAnimationLoop(() => {
    delta = clock.getDelta();

    cube.rotation.x += 1 * delta;
    cube.rotation.y += 1 * delta;

    raycaster.setFromCamera(mouse, camera);
    const intersect = raycaster.intersectObject(cube, false);

    if (intersect.length > 0) {
        cube.material = m_solidGreen;
    } else {
        cube.material = m_basic;
    }

    if (face) {
        face.rotation.x += 1 * delta;
        face.rotation.y += 1 * delta;
        const intersect = raycaster.intersectObject(face, false);
        if (intersect.length > 0) {
            face.material = m_solidGreen;
        } else {
            face.material = m_basic;
        }
    }

    renderer.render(scene, camera);
    fps.update();
    deltaDebug.update(`FPS: ${fps.value}\ndelta: ${delta}\nmouse: ${mouse.x}, ${mouse.y}`);
});

function updateRenderSize() {
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.raycast
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener('resize', updateRenderSize);
window.addEventListener('load', updateRenderSize);

canvas.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = - (e.clientY / canvas.clientHeight) * 2 + 1;
});

canvas.addEventListener('mouseleave', e => {
    mouse.x = -1;
    mouse.y = -1;
});

window.addEventListener('error', function (event) {
    // Stop animation loop on uncaught error
    event.preventDefault();
    renderer.setAnimationLoop(null);
    throw event.error;
});

const loader = new STLLoader();

import './models/shrekosaur.stl';


loader.load('/models/shrekosaur.stl', function (geometry) {
    face = new THREE.Mesh(geometry, m_basic);
    // scene.add(face);
}, undefined, function (error) {
    console.error(error);
});
