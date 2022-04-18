import * as THREE from 'three';
import FPS from './fps';
import Debug from './debug';
import Pong from './Pong';
import { Camera, Vector2 } from 'three';

export type Engine = {
    mouse: Vector2,
    camera: Camera
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight);

const engine = {
    mouse: new THREE.Vector2(-1, -1),
    camera
}

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

const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5);
scene.add(hemi);

const light = new THREE.PointLight(0xFFFFFF, 1, 200);
light.position.set(0, 10, 5);
scene.add(light);

camera.position.z = 17;

const clock = new THREE.Clock();
let delta = 0;

const pong = new Pong(scene, engine);

renderer.setAnimationLoop(() => {
    delta = clock.getDelta();

    pong.update(delta);

    renderer.render(scene, camera);

    fps.update();

    deltaDebug.update(`FPS: ${fps.value}\ndelta: ${delta}\nmouse: ${engine.mouse.x}, ${engine.mouse.y}\n` + pong.debug());
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
    engine.mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
    engine.mouse.y = - (e.clientY / canvas.clientHeight) * 2 + 1;
});

canvas.addEventListener('mouseleave', e => {
    engine.mouse.x = -1;
    engine.mouse.y = -1;
});

window.addEventListener('error', function (event) {
    // Stop animation loop on uncaught error
    event.preventDefault();
    renderer.setAnimationLoop(null);
    throw event.error;
});
