import {Color4, Mesh, ParticleSystem, PhysicsImpostor, Scene, StandardMaterial, Texture, Vector3} from "babylonjs";
import {TextBlock} from "babylonjs-gui";
import {BONUS_TYPES} from "./bonus-types";
import {COLLISION_GROUPS} from "./collision-groups";

export class Block {
    posX: number;
    posZ: number;
    mesh: Mesh;
    bonusType: BONUS_TYPES;
    showBonus: boolean;
    durability: number;
    scene: Scene;
    cubeText: TextBlock;
    particleSystem: ParticleSystem;
    partInterval: number;
    simpleBlock: Mesh;
    score: number = 0;
    isBot: boolean;

    constructor(posX: number, posZ: number, bonusType: BONUS_TYPES, durability: number, showBonuses: boolean, scene: Scene, simpleBlock: Mesh, isBot: boolean) {
        this.posX = posX;
        this.posZ = posZ;
        this.bonusType = bonusType;
        this.showBonus = showBonuses;
        this.durability = durability;
        this.scene = scene;
        this.simpleBlock = simpleBlock;
        this.isBot = isBot;
    }

    addToCubesArray(cubesArray: PhysicsImpostor[]): void {
        cubesArray.push(this.mesh.physicsImpostor);
    }

    init() {
        this.mesh = this.simpleBlock.clone(`box${(this.posX + 5) * (this.posZ + 7)}`);
        this.mesh.setAbsolutePosition(new Vector3(this.posX, 0.3, this.posZ));
        this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh, PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 1,
            friction: 0
        });
        this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BLOCKS;
        this.mesh.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BALLS | COLLISION_GROUPS.BULLETS;
        this.mesh.physicsImpostor.wakeUp();
        this.mesh.physicsImpostor.wakeUp();
        if (this.showBonus && this.bonusType != null) {
            this.partSys(new Vector3(this.mesh.getAbsolutePosition().x, 2, this.mesh.getAbsolutePosition().z));
        }

        this.scene.onDisposeObservable.add(() => {
            if (!this.mesh.isDisposed()) {
                this.mesh.dispose();
            }
        });

        if (this.isBot) {
            window.addEventListener(`botDestroyBlock${this.mesh.physicsImpostor.uniqueId}`, () => {
                console.log('good');
                this.destroyCube();
            });
        } else {
            window.addEventListener(`playerDestroyBlock${this.mesh.physicsImpostor.uniqueId}`, () => {
                console.log('good');
                this.destroyCube();
            });
        }
    }


    destroyCube() {
        if (this.particleSystem !== undefined) {
            this.particleSystem.stop();
            clearInterval(this.partInterval);
        }
        this.mesh.dispose();
    }

    changeMaterial(block1: StandardMaterial, block2: StandardMaterial, block3: StandardMaterial) {
        switch (this.durability) {
            case 1:
                console.log('case 1');
                this.mesh.material = block1;
                this.score = 10;
                return 'mat1';
            case 2:
                console.log('case 2');
                this.mesh.material = block2;
                this.score = 20;
                return 'mat2';
            default:
                console.log('case 3');
                this.mesh.material = block3;
                this.score = 30;
                break;
        }
    }

    private partSys(position?: Vector3) {
        this.particleSystem = new ParticleSystem("stars", 1000, this.scene);
        if (this.bonusType === BONUS_TYPES.MINUS_SIZE) {
            this.particleSystem.particleTexture = new Texture("images/redSquare.png", this.scene);
        } else {
            this.particleSystem.particleTexture = new Texture("images/bullet.png", this.scene);
        }
        this.particleSystem.emitter = position;
        this.particleSystem.color1 = new Color4(1, 1, 1);
        this.particleSystem.color2 = new Color4(1, 1, 1);
        this.particleSystem.colorDead = new Color4(1, 1, 1, 1);
        this.particleSystem.createSphereEmitter(0.1);
        this.particleSystem.emitRate = 30;
        this.particleSystem.minEmitPower = 0;
        this.particleSystem.maxEmitPower = 0.2;
        this.particleSystem.addStartSizeGradient(0, 0.1);
        this.particleSystem.minAngularSpeed = 0;
        this.particleSystem.maxAngularSpeed = Math.PI;
        this.particleSystem.targetStopDuration = .5;
        this.particleSystem.maxLifeTime = 0.5;
        this.partInterval = setInterval(() => {
            this.particleSystem.start();
        }, 1500);

        this.scene.onDisposeObservable.add(() => {
            clearInterval(this.partInterval);
            this.particleSystem.dispose();
        })

    }


}
