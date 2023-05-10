import { Mesh, MeshBuilder, PhysicsImpostor, Scene, Vector3 } from "babylonjs";
import { AdvancedDynamicTexture } from "babylonjs-gui";
import { BONUS_TYPES } from "./bonus-types";
import { Counter } from "./counter";
import { CUBES_MAP } from "./func-types";
import {COLLISION_GROUPS} from "./collision-groups";

const GAME_EVENT = (type: any, payload?: number | string ) => new CustomEvent('gameEvent', {detail: {type, payload}});

export class Ball {
    intervalUpdateSpeed: number;
    speedBonus: number = 0.06;
    speedVec: Vector3 = new Vector3(7, 7, 7);
    speed: number = 7;
    ball: Mesh;
    ballReleased: boolean;
    paddle: Mesh;
    paddleImpostors: PhysicsImpostor[];
    ind: number;


    constructor(position: Vector3, scene: Scene, paddle: Mesh, speed: number, ballsOnBoard: Counter, wallBot: Mesh,
                ballsArray: PhysicsImpostor[], speedVec: Vector3, reb: number, setBall: () => void, forceGameOver: (cubesMap?: CUBES_MAP) => void,
                livesCounter: Counter, context: Object, reduceLives: () => void, sendInformation: () => void, gameContext: Object, maxSpeed: number, speedBonus: number,
                paddleImpostors: PhysicsImpostor[], ballsMeshArray: Mesh[], ballsAdvancedTextureArray: AdvancedDynamicTexture[], isSuperBall: boolean,
                regImpostor: () => void, ballId: number, collideFuncX: () => void, collideFuncZ: () => void, wallTop: Mesh, wallRight: Mesh, wallLeft: Mesh) {
        this.speedVec = speedVec;
        this.speed = speed;
        this.speedBonus = speedBonus;
        this.ball = MeshBuilder.CreateSphere('ball', { diameter: 0.26 }, scene);
        console.log(this.ball.collisionGroup & this.ball.collisionMask);
        this.paddle = paddle;
        this.paddleImpostors = paddleImpostors;
        ballsMeshArray.push(this.ball);

        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.ball);
        advancedTexture.background = 'lightgrey';
        if (isSuperBall) {
            advancedTexture.background = 'red';
        }

        ballsAdvancedTextureArray.push(advancedTexture);
        this.ball.position = position;
        this.ball.physicsImpostor = new PhysicsImpostor(this.ball, PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 1, friction: 0, damping: 0 }, scene);
        this.ball.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BALLS;
        this.ball.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BLOCKS | COLLISION_GROUPS.WALLS | COLLISION_GROUPS.PADDLE;
        this.ball.physicsImpostor.wakeUp();


        ballsOnBoard.inc();
        this.ind = ballsArray.push(this.ball.physicsImpostor) - 1;
        this.ballReleased = true;


        const obserever = scene.onBeforeRenderObservable.add(() => {
            const reslutVec = this.ball.physicsImpostor?.getLinearVelocity().normalize().multiply(this.speedVec);
            this.ball.physicsImpostor?.setLinearVelocity(reslutVec);
        });


        this.ball.physicsImpostor.registerOnPhysicsCollide(wallBot.physicsImpostor, () => {
            scene.onBeforeRenderObservable.remove(obserever);
            scene.onAfterPhysicsObservable.addOnce(() => {
                this.ball.dispose();
                globalThis.dispatchEvent(GAME_EVENT('Ball', ballId));
                ballsArray[this.ind] = undefined;
                ballsOnBoard.dec();
                if (ballsOnBoard.get() <= 0) {
                    reduceLives.bind(context)();
                    sendInformation.bind(gameContext)();
                    if (livesCounter.get() <= 0) {
                        forceGameOver.bind(gameContext)();
                    }
                    else {
                        setBall.bind(context)();
                    }
                }
            })
        });

        this.ball.physicsImpostor.registerOnPhysicsCollide(wallRight.physicsImpostor, collideFuncZ);
        this.ball.physicsImpostor.registerOnPhysicsCollide(wallLeft.physicsImpostor, collideFuncZ);
        this.ball.physicsImpostor.registerOnPhysicsCollide(wallTop.physicsImpostor, collideFuncX);

        //regImpostor.bind(this)();
        this.ball.physicsImpostor.registerOnPhysicsCollide(this.paddleImpostors, () => {
            if (this.ball.physicsImpostor.getLinearVelocity().z > 0) {
                const hitPoint = this.ball.getAbsolutePosition(); // hit point сложно получить по этому центр мяча
                const paddleCenter = this.paddle.getAbsolutePosition().x;
                let diff = (hitPoint.x - paddleCenter) / +(this.paddle.scaling.x / 2);
                if (diff > 1) {
                    diff = 0.99;
                }
                if (diff < -1) {
                    diff = -0.99;
                }
                const rebound = this.speed * 0.75;
                const resVec = Vector3.Zero();
                if (diff > 0) {
                    resVec.set(Math.abs(rebound * diff), this.ball.physicsImpostor.getLinearVelocity().y,
                        -Math.sqrt(this.speed ** 2 - diff ** 2 * rebound ** 2));
                }
                else {
                    resVec.set(-Math.abs(rebound * diff), this.ball.physicsImpostor.getLinearVelocity().y,
                        -Math.sqrt(this.speed ** 2 - diff ** 2 * rebound ** 2));
                }
                this.ball.physicsImpostor.setLinearVelocity(resVec);
            }
            else {
                const { x, y, z } = this.ball.physicsImpostor.getLinearVelocity();
                const norm = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
                const resVec = Vector3.Zero();
                resVec.set(x, y, z);
                resVec.scale(this.speed / norm);
                this.ball.physicsImpostor.setLinearVelocity(resVec);
            }
        });




        const vec = new Vector3(-5, 0, -5);
        this.ballReleased = true;
        this.ball.physicsImpostor.setLinearVelocity(vec);
        this.intervalUpdateSpeed = setInterval(() => {
            if (this.speedVec.x * (1 + this.speedBonus) > this.speed * maxSpeed) {
                return;
            }
            this.speedVec = this.speedVec.scale(1 + this.speedBonus);
        }, 5000);

        scene.onDisposeObservable.add(() => {
            if (!this.ball.isDisposed()) {
                this.ball.dispose()
            }
            advancedTexture.dispose();
            if (!this.paddle.isDisposed()) {
                this.paddle.dispose(false, true);
            }
        })
    }


    shootBall(): void {
        const vec = new Vector3(-Math.sqrt(this.speed / 2), 0, -Math.sqrt(this.speed / 2));
        this.ball.physicsImpostor.setLinearVelocity(vec);
        this.intervalUpdateSpeed = setInterval(() => {
            this.speedVec = this.speedVec.scale(1 + this.speedBonus);
        }, 5000);
        this.ballReleased = true;
    }
}
