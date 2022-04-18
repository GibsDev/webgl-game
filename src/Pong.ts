import * as THREE from 'three';
import { MathUtils, Vector3 } from 'three';
import { Engine } from './index';

// TODO trailing velocity of paddle for power of shot

let extraDebug: string = '';

const material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
const wireframe = new THREE.MeshBasicMaterial({ color: 0x0000FF, wireframe: true });
const raycaster = new THREE.Raycaster();

interface GameObject {
    pong: Pong;
    obj: THREE.Object3D;
    update(delta: number): void;
}

class Ball implements GameObject {
    pong: Pong;
    velocity: THREE.Vector2;
    obj: THREE.Object3D = null;
    geometry: THREE.BoxGeometry;

    constructor(pong: Pong) {
        this.pong = pong;
        this.velocity = new THREE.Vector2(
            MathUtils.randInt(-10, 10),
            0 //MathUtils.randInt(-10, 10)
        );

        this.geometry = new THREE.BoxGeometry();
        this.geometry.computeBoundingBox();
        this.obj = new THREE.Mesh(this.geometry, material);
    }

    update(delta: number): void {
        // Need to track the last position for both the paddle and ball so we know what direction that arre coming from
        const worldPos = this.getWorldOrigin();

        // Check for paddle collisions
        const p1 = this.pong.player1;
        const p1intersect = p1.getWorldBoundingBox().intersect(this.getWorldBoundingBox());
        console.log(p1intersect);
        if (p1intersect.min.x !== Infinity) {
            extraDebug = JSON.stringify(p1intersect.max.sub(p1intersect.min));
        }

        const p1dist = p1.geometry.boundingBox.distanceToPoint(p1.getWorldOrigin().sub(worldPos));
        if (p1dist <= 0.5) {
            // TODO calculate collision
            p1.geometry.boundingBox.intersect
            const p1origin = p1.getWorldOrigin();
            const top = p1origin.y - (p1.getHeight() / 2);
            const bottom = p1origin.y - (p1.getHeight() / 2);
            const right = p1origin.x + (p1.getWidth() / 2);
            
            if (worldPos.y < bottom && worldPos.x < right) {

            } else if (worldPos.y > top && worldPos.x < right) {

            } else {
                this.velocity.x = Math.abs(this.velocity.x);
            }
        }


        const p2 = this.pong.player2;
        const p2dist = p2.geometry.boundingBox.distanceToPoint(p2.getWorldOrigin().sub(worldPos));
        if (p2dist <= 0.5) {
            if (true) {
                this.velocity.x = -Math.abs(this.velocity.x);
            }
        }



        // Vertical bounds
        if (Math.abs(worldPos.y) > 9.5) {
            this.velocity.y = (worldPos.y < 0 ? 1 : -1) * Math.abs(this.velocity.y);
        }

        // Reset out of x bounds
        const dist = worldPos.distanceTo(new Vector3(0, 0, 0));
        if (dist > 14) {
            this.obj.translateX(-worldPos.x);
            this.obj.translateY(-worldPos.y);
            this.velocity.y = MathUtils.randInt(-10, 10);
        }

        // Apply move
        this.obj.translateX(this.velocity.x * delta);
        this.obj.translateY(this.velocity.y * delta);

    }

    getWorldOrigin() {
        const origin = new THREE.Vector3();
        this.obj.getWorldPosition(origin);
        return origin;
    }

    getWorldBoundingBox(): THREE.Box3 {
        const box = this.geometry.boundingBox.clone();
        box.translate(this.getWorldOrigin());
        return box;
    }
}

abstract class Paddle implements GameObject {
    pong: Pong;
    points: number;
    obj: THREE.Object3D = null;
    geometry: THREE.BoxGeometry;

    constructor(pong: Pong) {
        this.pong = pong;
        this.geometry = new THREE.BoxGeometry(1, 5, 1);
        // TODO not sure if this is required
        this.geometry.computeBoundingBox();
        this.obj = new THREE.Mesh(this.geometry, material);
    }

    update(delta: number) { }

    getWorldOrigin(): THREE.Vector3 {
        const origin = new THREE.Vector3();
        this.obj.getWorldPosition(origin);
        return origin;
    }

    private getSize(): THREE.Vector3 {
        const size = new THREE.Vector3();
        return this.geometry.boundingBox.getSize(size);
    }

    getWidth(): number {
        return this.getSize().x;
    }

    getHeight(): number {
        return this.getSize().y;
    }

    getWorldBoundingBox(): THREE.Box3 {
        const box = this.geometry.boundingBox.clone();
        box.translate(this.getWorldOrigin());
        return box;
    }
}

class Scoreboard implements GameObject {
    pong: Pong;
    player1: Paddle;
    player2: Paddle;
    obj: THREE.Object3D = null;

    constructor(pong: Pong, player1: Paddle, player2: Paddle) {
        this.pong = pong;
        this.player1 = player1;
        this.player2 = player2;
    }

    update(delta: number): void {
        // Manipulate objects in the scene to show the current score
        //throw new Error('Method not implemented.');
    }
}

class HumanPaddle extends Paddle {

    constructor(pong: Pong) {
        super(pong);
        this.obj.translateX(-10);
    }

    update(delta: number): void {
        const position = new THREE.Vector3();
        this.obj.getWorldPosition(position);

        raycaster.setFromCamera(this.pong.engine.mouse, this.pong.engine.camera);
        const intersect = raycaster.intersectObject(this.pong.fieldPlane, false).pop();
        if (intersect) {
            this.obj.translateY(intersect.point.y - position.y);
        }
    }
}

class ComputerPaddle extends Paddle {

    private speedLimit = 7;

    constructor(pong: Pong) {
        super(pong);
        this.obj.translateX(10);
    }

    update(delta: number): void {
        const position = this.getWorldOrigin();
        const ballPosition = this.pong.ball.getWorldOrigin();
        const diff = ballPosition.y - position.y;
        let move = diff * delta;

        const maxMove = this.speedLimit * delta;

        if (diff < -maxMove) {
            move = -maxMove;
        }
        if (diff > maxMove) {
            move = maxMove;
        }

        this.obj.translateY(move);
    }
}

export default class Pong {

    ball: Ball;
    scoreboard: Scoreboard;
    player1: Paddle;
    player2: Paddle;

    engine: Engine;
    arenaWidth: number = 10;
    arenaHeight: number = 5;
    fieldPlane: THREE.Object3D;

    constructor(scene: THREE.Scene, engine: Engine) {
        this.engine = engine;
        this.ball = new Ball(this);
        this.player1 = new HumanPaddle(this);
        this.player2 = new ComputerPaddle(this);
        this.scoreboard = new Scoreboard(this, this.player1, this.player2);
        const fieldGeom = new THREE.PlaneGeometry(20, 20);
        this.fieldPlane = new THREE.Mesh(fieldGeom, wireframe);

        for (const object of this.getObjects()) {
            if (object !== null) {
                scene.add(object);
            }
        }

        scene.add(this.fieldPlane);
    }

    update(delta: number): void {
        this.player1.update(delta);
        this.player2.update(delta);
        this.ball.update(delta);
        this.scoreboard.update(delta);
    }

    getObjects(): Array<THREE.Object3D> {
        return [
            this.ball.obj,
            this.player1.obj,
            this.player2.obj,
            this.scoreboard.obj,
        ];
    }

    debug(): string {
        return `velocity: ${this.ball.velocity.x}, ${this.ball.velocity.y}\n`
            + `extraDebug: ${extraDebug}`;
    }
}