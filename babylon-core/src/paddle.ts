import { Material, Mesh, MeshBuilder, PhysicsImpostor, Scene, Vector3 } from "babylonjs";
import {COLLISION_GROUPS} from "./collision-groups";

export class Paddle {
    mesh: Mesh;
    minPaddleScaling: number;
    maxPaddleScaling: number;
    paddleMaxDeviation: number = 1.4;
    paddleMat: Material;
    scene: Scene;
    paddleImpostors: PhysicsImpostor[] = [];
    normalizeTimeout: number;
    isPlusSize: boolean = false;
    isMinusSize: boolean = false;

    constructor(minPaddleScaling: number, maxPaddleScaling: number, paddleMat: Material, scene: Scene) {
        this.minPaddleScaling = minPaddleScaling;
        this.maxPaddleScaling = maxPaddleScaling;
        this.paddleMat = paddleMat;
        this.scene = scene;
    }

    init() {
        this.mesh = MeshBuilder.CreateBox('paddle', {width: 1, height: 5, depth: 0.2}, this.scene);
        let paddleSize = localStorage.getItem('paddleSize') === null ? 2.2 : +localStorage.getItem('paddleSize');
        paddleSize = Math.max(paddleSize, 0.3);
        this.minPaddleScaling = Math.max(paddleSize - 0.8, 0.3);
        this.maxPaddleScaling = Math.min(paddleSize + 0.8, 3.6);

        let newPaddleSizeDifference = -this.mesh.getBoundingInfo().boundingBox.extendSize.x;
        this.mesh.scaling.x += (paddleSize - 1);
        newPaddleSizeDifference += this.mesh.getBoundingInfo().boundingBox.extendSize.x * (paddleSize);
        this.paddleMaxDeviation -= newPaddleSizeDifference;

        this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 1, friction: 0 });
        this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.PADDLE;
        this.mesh.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BONUSES | COLLISION_GROUPS.BALLS;
        this.paddleImpostors.push(this.mesh.physicsImpostor);
        this.mesh.material = this.paddleMat;
        console.log(this.paddleMat);
        this.mesh.setAbsolutePosition(new Vector3(0, 0, 1.9));
        this.scene.onDisposeObservable.add(() => {
            if (!this.mesh.isDisposed()) {
                this.mesh.dispose(false, true);
            }
            this.paddleMat.dispose();
            this.paddleImpostors.length = 0;
        })
    }

    regImpostor() {
        const physTemp = new PhysicsImpostor(this.mesh, PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 1,
            friction: 0
        });
        physTemp.physicsBody.collisionFilterGroup = COLLISION_GROUPS.PADDLE;
        physTemp.physicsBody.collisionFilterMask = COLLISION_GROUPS.BONUSES | COLLISION_GROUPS.BALLS;
        this.scene.onAfterPhysicsObservable.addOnce(() => {
            this.paddleImpostors.push(physTemp);
            physTemp.wakeUp();
            this.paddleImpostors.shift();
            this.mesh.physicsImpostor.dispose();
            this.mesh.physicsImpostor = physTemp;
            this.mesh.physicsImpostor.wakeUp();
        });

        this.scene.onDisposeObservable.add(() => {
            physTemp.dispose();
        })
    }

    normalize() {
        this.mesh.scaling.x = 1;
        this.paddleMaxDeviation = 1.4;
        this.regImpostor();
    }

    minusSize() {
        if (this.isPlusSize) {
            clearTimeout(this.normalizeTimeout);
            this.normalize();
            this.isPlusSize = false;
        }
        this.mesh.scaling.x = .75;
        this.paddleMaxDeviation += 0.125;
        this.regImpostor();
        this.isMinusSize = true;
        this.normalizeTimeout = setTimeout(() => {
            this.normalize();
            this.isMinusSize = false;
        }, 10000)
    }

    plusSize() {
        if (this.isMinusSize) {
            clearTimeout(this.normalizeTimeout);
            this.normalize();
            this.isMinusSize = false;
        }
        this.mesh.scaling.x = 1.25;
        this.paddleMaxDeviation -= 0.125;
        this.regImpostor();
        this.isPlusSize = true;
        this.normalizeTimeout = setTimeout(() => {
            this.normalize();
            this.isPlusSize = false;
        }, 10000)
    }
}