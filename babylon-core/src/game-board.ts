import {
    AssetsManager,
    CannonJSPlugin,
    Color3,
    Engine,
    HardwareScalingOptimization,
    HemisphericLight,
    LensFlaresOptimization,
    MergeMeshesOptimization,
    Mesh,
    MeshBuilder,
    Observer,
    ParticlesOptimization,
    ParticleSystem,
    PhysicsImpostor,
    PostProcessesOptimization,
    RenderTargetsOptimization,
    Scene,
    SceneLoader,
    SceneOptimizer,
    SceneOptimizerOptions,
    ShadowsOptimization,
    StandardMaterial,
    Texture,
    TextureOptimization,
    Vector3
} from "babylonjs";
import {AdvancedDynamicTexture, Control, TextBlock} from "babylonjs-gui";
import {Ball} from "./ball";
import {Counter} from "./counter";
import {Gun} from "./gun";
import {BONUS_TYPES} from './bonus-types'
import {Block} from "./block";
import {BonusBlock} from "./bonus-block";
import {Paddle} from "./paddle";
import {CUBES_MAP} from "./func-types";
import {COLLISION_GROUPS} from "./collision-groups";
import Ellipse = BABYLON.GUI.Ellipse;
import Button = BABYLON.GUI.Button;


declare var require: any;

const GAME_EVENT = (type: any, payload?: number | string) => new CustomEvent('gameEvent', {detail: {type, payload}});

export class GameBoard {
    scene: Scene;
    ground: Mesh;
    wallLeft: Mesh;
    wallRight: Mesh;
    wallBot: Mesh;
    wallTop: Mesh;
    wallMat: StandardMaterial;
    cubeMat: StandardMaterial;
    ball: Mesh;
    paddle: Paddle;
    speed: number = 7;
    cubesCounter: number = 10;
    cubesGenerated: number = 10;
    intervalUpdateSpeed: number;
    timeInterval: number;
    speedBonus: number = 0.06;
    maxSpeed: number;
    speedVec: Vector3;
    scoreValue: Control;
    targetValue: Control;
    livesGui: Ellipse[] = [];
    time: Control;
    seconds: number;
    paddleMat: StandardMaterial;
    ballReleased: boolean;
    botScene: Scene;
    engine: Engine;
    cubesSetted: number = 0;
    ballPower: number = 1;
    ballsOnBoard: Counter = new Counter(1);
    ballsArray: PhysicsImpostor[] = [];
    ballsMeshArray: Mesh[] = [];
    ballsAdvancedTextureArray: AdvancedDynamicTexture[] = [];
    ballsPositionArray: { x: number, z: number }[] = [];
    bulletsArray: PhysicsImpostor[] = [];
    cubesArray: PhysicsImpostor[] = [];
    blockArray: Block[] = [];
    ballObserever: Observer<Scene>;
    bonusTexture: Texture;
    backgroundMaterial: StandardMaterial;
    plusSizeMaterial: StandardMaterial;
    superBallMaterial: StandardMaterial;
    doubleBallMaterial: StandardMaterial;
    minusSizeMaterial: StandardMaterial;
    energyMaterial: StandardMaterial;
    paddleMaterial: StandardMaterial;
    bulletMaterial: StandardMaterial;
    bulletBonusMaterial: StandardMaterial;
    extraLiveMaterial: StandardMaterial
    block1: StandardMaterial;
    block2: StandardMaterial;
    block3: StandardMaterial;
    isSuperBall: boolean = false;
    isEnergyBall: boolean = false;
    blockValue: number = 0;
    lives: number = 2;
    livesValue: Control;
    secondsCounter: Counter;
    blocksCounter: Counter;
    livesCounter: Counter;
    scoreCounter: Counter;
    showBonus: boolean = true;
    gunIntervalId: Counter = new Counter(0);
    maxPaddleScaling: number;
    minPaddleScaling: number;
    rebound: number = 1;
    isBot: boolean = false;
    forceGameOver: (cubesMap?: CUBES_MAP) => void;
    startTimer: () => void;
    context: Object;
    superBallInterval: number;
    energyBallInterval: number;
    cubesMap: CUBES_MAP;
    blocksArray: Block[] = [];
    ind: number;
    renderSceneFunc: () => void;
    clickFunc: (event: any) => void;
    sendInformation: () => void;
    storageListener: (event: any) => void;
    paddleTexture: Texture;
    particleSystem: ParticleSystem;
    posObserever: Observer<Scene>;
    ballId: number = 1;
    paused: boolean;
    optimizerOptions: SceneOptimizerOptions;
    optimizer: SceneOptimizer;
    textureCnt: number = 0;
    simpleBlock: Mesh;
    whiteBlockMaterial: StandardMaterial;
    orangeBlockMaterial: StandardMaterial;
    redBlockMaterial: StandardMaterial;
    greenBonusMaterial: StandardMaterial;
    lightgreyMaterial: StandardMaterial;
    ballMaterial: StandardMaterial;
    cntMask: number = 0;
    texturesToLoad = 11;
    exitButton: Button;
    assetsManager: AssetsManager;
    collideFuncX: () => void;
    collideFuncZ: () => void;

    constructor(engine: Engine, isBot: boolean, cubesMap: CUBES_MAP,
                forceGameOver: (cubesMap?: CUBES_MAP) => void, startTimer: () => void, sendInformation: () => void,
                context: Object, secondsCounter: Counter, blocksCounter: Counter, livesCounter: Counter, scoreCounter: Counter) {
        this.forceGameOver = forceGameOver;
        //this.forceGameOver = this.forceGameOver.bind(context);
        this.startTimer = startTimer;
        this.sendInformation = sendInformation;
        this.sendInformation = this.sendInformation.bind(context);
        this.context = context;
        this.secondsCounter = secondsCounter;
        this.blocksCounter = blocksCounter;
        this.livesCounter = livesCounter;
        this.scoreCounter = scoreCounter;
        this.engine = engine;
        this.isBot = isBot;
        this.cubesMap = cubesMap;
    }

    generateCube(x: number, z: number, cubesMap: CUBES_MAP): void {
        if (cubesMap[this.cubesSetted].genValue === 0) {
            this.cubesSetted++;
            return;
        }
        const block = new Block(x, z, cubesMap[this.cubesSetted].bonus, cubesMap[this.cubesSetted].genValue,
            this.showBonus, this.scene, this.simpleBlock, this.isBot);
        block.init();
        block.changeMaterial(this.block1, this.block2, this.block3);
        this.blocksArray.push(block);
        this.cubesSetted++;
        const blockNum = this.cubesSetted;
        this.cubesArray.push(block.mesh.physicsImpostor);
        this.blockArray.push(block);

        const con = this;

        let forceDestroyFunc = () => {
            this.scene.onBeforeRenderObservable.runCoroutineAsync(dest());
            dest = undefined;
        };
        if (!this.isBot) {
            window.addEventListener(`playerForceDestroy${block.mesh.physicsImpostor.uniqueId}`, forceDestroyFunc);
        } else {
            window.addEventListener(`botForceDestroy${block.mesh.physicsImpostor.uniqueId}`, forceDestroyFunc);
        }

        let dest = function* () {
            block.destroyCube();
            globalThis.dispatchEvent(GAME_EVENT('Block', blockNum));
            yield;
            if (block.bonusType) {
                con.generateBonus(block.mesh.getAbsolutePosition(), block.bonusType);
                yield;
            }
            con.reduceNumOfCubes();
            con.blocksCounter.dec();
            con.sendInformation();
            if (con.scoreValue instanceof TextBlock) {
                con.scoreCounter.addNumber(block.score);
                const val = String(+con.scoreValue.text + block.score);
                con.scoreValue.text = ('00000000' + val).slice(val.length, val.length + 8);
                yield;
            }
            if (con.targetValue instanceof TextBlock) {
                con.targetValue.text = con.cubesCounter + '/' + con.cubesGenerated;
                yield;
            }
            if (con.isGameOver()) {
                con.forceGameOver.bind(con.context)();
            }
            con.sendInformation();
        }

        block.mesh.physicsImpostor.registerOnPhysicsCollide(this.ballsArray, () => {
            if (dest !== undefined) {
                if (this.ballPower === 0) {
                    return;
                }
                const powerBefore = this.ballPower;
                block.durability -= this.ballPower;
                this.ballPower = 0;
                setTimeout(() => {
                    this.ballPower = powerBefore;
                }, 0);
                if (+block.durability <= 0) {
                    this.scene.onBeforeRenderObservable.runCoroutineAsync(dest());
                    dest = undefined;
                } else {
                    const mat = block.changeMaterial(this.block1, this.block2, this.block3);
                    globalThis.dispatchEvent(GAME_EVENT('changeMaterial', blockNum));
                }
            }
        });


        block.mesh.physicsImpostor.registerOnPhysicsCollide(this.bulletsArray, () => {
            if (dest !== undefined) {
                setTimeout(() => {
                    block.durability--;
                    if (block.durability <= 0) {
                        this.scene.onBeforeRenderObservable.runCoroutineAsync(dest());
                        dest = undefined
                    } else {
                        const mat = block.changeMaterial(this.block1, this.block2, this.block3);
                        globalThis.dispatchEvent(GAME_EVENT('changeMaterial', blockNum));
                    }
                })
            }
        });
    }

    generateRowOfCubes(cubesInRow: number, rowPositionZ: number, cubesMap: CUBES_MAP): void {
        let x = 1.72;
        for (let i = 0; i < cubesInRow; i++) {
            this.generateCube(x, rowPositionZ, cubesMap);
            x -= 0.38;
        }
    }

    generateBoardOfCubes(cubesMap: CUBES_MAP): void {
        this.cubesCounter = this.cubesGenerated = this.blocksCounter.get();
        const numOfRows = Math.floor(cubesMap.length / 10);
        const lastRowNum = cubesMap.length % 10;
        let rowPositionZ = -5.09;
        for (let i = 0; i < numOfRows; i++) {
            this.generateRowOfCubes(10, rowPositionZ, cubesMap);
            rowPositionZ += 0.4;
        }
        this.generateRowOfCubes(lastRowNum, rowPositionZ, cubesMap);
        if (this.targetValue instanceof TextBlock) {
            this.targetValue.text = this.cubesCounter + '/' + this.cubesGenerated;
        }
        console.log('all blocks added');
    }


    generateBonus(position: Vector3, type: BONUS_TYPES): void {
        const bonusBlock = new BonusBlock(position, type, this.scene, this.plusSizeMaterial, this.superBallMaterial,
            this.doubleBallMaterial, this.bulletBonusMaterial, this.minusSizeMaterial, this.energyMaterial, this.extraLiveMaterial);
        bonusBlock.init();
        if (!this.isBot && bonusBlock.mesh.collisionMask === 2) {
            this.cntMask++;
            console.log(this.cntMask);
        }

        bonusBlock.mesh.physicsImpostor.registerOnPhysicsCollide(this.paddle.paddleImpostors, () => {
            this.scene.onAfterPhysicsObservable.addOnce(() => bonusBlock.mesh.dispose());
            switch (type) {
                case BONUS_TYPES.PLUS_SIZE:
                    this.plusSize();
                    break;
                case BONUS_TYPES.SUPER_BALL:
                    this.superBall();
                    break;
                case BONUS_TYPES.DOUBLE_BALL:
                    this.doubleBalls();
                    break;
                case BONUS_TYPES.MINUS_SIZE:
                    this.minusSize();
                    break;
                case BONUS_TYPES.ENERGY:
                    this.energy();
                    break;
                case BONUS_TYPES.EXTRA_LIVE:
                    this.extraLive();
                    break;
                case BONUS_TYPES.GUN:
                    this.gun();
                    break;
            }
        });

        bonusBlock.mesh.physicsImpostor.registerOnPhysicsCollide([...this.paddle.paddleImpostors, this.wallBot.physicsImpostor], () => {
            this.scene.onAfterPhysicsObservable.addOnce(() => bonusBlock.mesh.dispose());
        });
    }

    gun(): void {
        clearInterval(this.gunIntervalId.get());
        const gun = new Gun(this.paddle.mesh, this.bulletMaterial, this.cubesArray, this.bulletsArray, this.wallTop,
            this.scene, this.gunIntervalId);
        globalThis.dispatchEvent(GAME_EVENT('gun'));
    }

    minusSize(): void {
        this.paddle.minusSize();
        globalThis.dispatchEvent(GAME_EVENT('minusSize'));
    }

    plusSize(): void {
        this.paddle.plusSize();
        globalThis.dispatchEvent(GAME_EVENT('plusSize'));
    }

    superBall(): void {
        const con = this;
        clearTimeout(con.superBallInterval);
        const colorRedCoroutine = function* () {
            con.ballPower += 1000;
            con.isSuperBall = true;
            const ballsPerFrame = con.ballsAdvancedTextureArray.length / 10 + 1;
            let it = 0;
            yield;
            while (it < con.ballsAdvancedTextureArray.length) {
                for (let i = 0; i < ballsPerFrame && it < con.ballsAdvancedTextureArray.length; i++, it++) {
                    con.ballsAdvancedTextureArray[it].background = 'red';
                }
                yield;
            }
        }
        this.scene.onBeforeRenderObservable.runCoroutineAsync(colorRedCoroutine());

        this.superBallInterval = setTimeout(() => {
            const colorGreyCoroutine = function* () {
                const ballsPerFrame = con.ballsAdvancedTextureArray.length / 10 + 1;
                let it = 0;
                yield;
                while (it < con.ballsAdvancedTextureArray.length) {
                    for (let i = 0; i < ballsPerFrame && it < con.ballsAdvancedTextureArray.length; i++, it++) {
                        con.ballsAdvancedTextureArray[it].background = 'lightgrey';
                    }
                    yield;
                }
                con.ballPower = 1;
                con.isSuperBall = false;
            }
            this.scene.onBeforeRenderObservable.runCoroutineAsync(colorGreyCoroutine());
        }, 10000);
        globalThis.dispatchEvent(GAME_EVENT('superBall'));
    }


    doubleBalls(): void {
        const con = this;
        console.log(this.ballsArray);
        const doubleBallsCoroutine = function* () {
            const len = con.ballsArray.length;
            const ballsPerFrame = 1;
            let it = 0;
            yield;
            while (it < len) {
                for (let i = 0; i < ballsPerFrame && it < len; i++, it++) {
                    if (con.ballsOnBoard.get() >= 12) {
                        console.log('Balls on board: ', con.ballsOnBoard.get())
                        it = len;
                        break;
                    }
                    if (con.ballsArray[it] === undefined) {
                        i--;
                        continue;
                    }
                    globalThis.dispatchEvent(GAME_EVENT('spawnBall'));
                    const a = new Ball(con.ballsArray[it].getObjectCenter(), con.scene, con.paddle.mesh, con.speed, con.ballsOnBoard,
                        con.wallBot, con.ballsArray, con.speedVec, con.rebound, con.setBall, con.forceGameOver,
                        con.livesCounter, con, con.reduceLives, con.sendInformation, con.context, con.maxSpeed, con.speedBonus, con.paddle.paddleImpostors,
                        con.ballsMeshArray, con.ballsAdvancedTextureArray, con.isSuperBall, con.registerBallPhysicImpostor, con.ballId,
                        con.collideFuncX, con.collideFuncZ, con.wallTop, con.wallLeft, con.wallRight);
                    con.ballId++;
                    ;
                }
                yield;
            }
        };
        this.scene.onBeforeRenderObservable.runCoroutineAsync(doubleBallsCoroutine());
    }

    energy() {
        const con = this;
        let energyObserver;
        clearTimeout(con.energyBallInterval);

        let energyBalls = () => {
            for (let i = 0; i < this.blockArray.length; i++) {
                if (!this.blockArray[i].mesh.isDisposed()) {
                    for (let j = 0; j < this.ballsMeshArray.length; j++) {
                        let blockPos = this.blockArray[i].mesh.getAbsolutePosition();
                        let ballPos = this.ballsMeshArray[j].getAbsolutePosition();
                        if (ballPos.x > blockPos.x - 0.32 && ballPos.x < blockPos.x + 0.32) {
                            if (ballPos.z > blockPos.z - 0.32 && ballPos.z < blockPos.z + 0.32) {
                                if (!this.isBot) {
                                    globalThis.dispatchEvent(new CustomEvent(`playerForceDestroy${this.blockArray[i].mesh.physicsImpostor.uniqueId}`));
                                } else {
                                    globalThis.dispatchEvent(new CustomEvent(`botForceDestroy${this.blockArray[i].mesh.physicsImpostor.uniqueId}`));
                                }
                                break;
                            }
                        }
                    }
                }
            }
        };




        const colorVioletCoroutine = function* () {
            con.ballPower += 1000;
            con.isEnergyBall = true;
            const ballsPerFrame = con.ballsAdvancedTextureArray.length / 10 + 1;
            let it = 0;
            yield;
            while (it < con.ballsAdvancedTextureArray.length) {
                for (let i = 0; i < ballsPerFrame && it < con.ballsAdvancedTextureArray.length; i++, it++) {
                    con.ballsAdvancedTextureArray[it].background = 'violet';
                }
                yield;
            }
            it = 0;
            while (it < con.ballsMeshArray.length) {
                if (!con.ballsMeshArray[it].isDisposed()) {
                    con.ballsMeshArray[it].physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.WALLS | COLLISION_GROUPS.PADDLE;
                    con.ballsMeshArray[it].physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BALLS;
                }
                it++;
                yield;
            }
            energyObserver = con.scene.onBeforeRenderObservable.add(energyBalls);
        };
        this.scene.onBeforeRenderObservable.runCoroutineAsync(colorVioletCoroutine());

        this.energyBallInterval = setTimeout(() => {
            const colorGreyCoroutine = function* () {
                const ballsPerFrame = con.ballsAdvancedTextureArray.length / 10 + 1;
                let it = 0;
                yield;
                while (it < con.ballsAdvancedTextureArray.length) {
                    for (let i = 0; i < ballsPerFrame && it < con.ballsAdvancedTextureArray.length; i++, it++) {
                        con.ballsAdvancedTextureArray[it].background = 'lightgrey';
                    }
                    yield;
                }
                con.ballPower = 1;
                con.isEnergyBall = false;
                it = 0;
                while (it < con.ballsMeshArray.length) {
                    if (!con.ballsMeshArray[it].isDisposed()) {
                        con.ballsMeshArray[it].physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BLOCKS | COLLISION_GROUPS.WALLS | COLLISION_GROUPS.PADDLE;
                        con.ballsMeshArray[it].physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BALLS;
                    }
                    it++;
                    yield;
                }
                con.scene.onBeforeRenderObservable.remove(energyObserver);
            };
            this.scene.onBeforeRenderObservable.runCoroutineAsync(colorGreyCoroutine());
        }, 5000);
        globalThis.dispatchEvent(GAME_EVENT('energyBall'));
    }

    extraLive(): void {
        this.increaseLives();
        globalThis.dispatchEvent(GAME_EVENT('extraLive'));
    }

    reduceNumOfCubes(): void {
        this.cubesCounter--;
    }

    isGameOver(): boolean {
        return !Boolean(this.cubesCounter) || this.lives <= 0 || this.blocksCounter.get() <= 0;
    }

    shootBall(): void {
        const vec = new Vector3(0, 0, -Math.sqrt(this.speed / 2));
        this.ball.physicsImpostor.setLinearVelocity(vec);
        this.speedVec = new Vector3(this.speed, this.intervalUpdateSpeed, this.speed);
        this.intervalUpdateSpeed = setInterval(() => {
            if (this.speedVec.x * (1 + this.speedBonus) > this.speed * this.maxSpeed) {
                return;
            }
            this.speedVec = this.speedVec.scale(1 + this.speedBonus);
        }, 5000);
        this.ballReleased = true;
        if (!this.isBot) {
            globalThis.dispatchEvent(new CustomEvent('ballReleased'));
        }
        localStorage.setItem('playerBallReleased', 'true');
    }

    reduceLives(): void {
        this.livesCounter.dec();
        this.lives--;
        this.livesGui[this.lives].background = 'black';
        if (this.livesValue instanceof TextBlock) {
            this.livesValue.text = String(this.lives);
        }
    }

    increaseLives(): void {
        if (this.lives < 5) {
            this.livesCounter.inc();
            this.lives++;
            this.livesGui[this.lives - 1].background = '#54F8C0'
            if (this.livesValue instanceof TextBlock) {
                this.livesValue.text = String(this.lives);
            }
        }
    }


    setBall(isFirstTime?: boolean): void {
        this.ball = MeshBuilder.CreateSphere('ball', {diameter: 0.26}, this.scene);
        console.log('ball setted');
        const ballId = this.ballId;
        this.ballId++;
        this.ballsMeshArray.push(this.ball);
        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.ball);
        advancedTexture.background = 'lightgrey';
        this.ballsAdvancedTextureArray.push(advancedTexture);
        this.isSuperBall = false;
        this.ballPower = 1;
        this.ball.position = new Vector3(0, 0.2, 1.6);
        this.ball.physicsImpostor = new PhysicsImpostor(this.ball, PhysicsImpostor.SphereImpostor,
            {mass: 1, restitution: 1, friction: 0, damping: 0}, this.scene);
        this.ball.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.BALLS;
        this.ball.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BLOCKS | COLLISION_GROUPS.WALLS | COLLISION_GROUPS.PADDLE;
        this.ball.physicsImpostor.wakeUp();
        this.ind = this.ballsArray.push(this.ball.physicsImpostor) - 1;
        this.ballReleased = false;
        if (!this.isBot) {
            localStorage.setItem('playerBallReleased', 'false');
        } else {
            localStorage.setItem('opponentBallReleased', 'false');
        }
        this.ballsOnBoard = new Counter(1);
        this.speedVec = new Vector3(this.speed, this.speed, this.speed);
        let reslutVec = Vector3.Zero();
        this.ballObserever = this.scene.onBeforeRenderObservable.add(() => {
            if (!this.ballReleased) {
                this.ball.position.x = this.paddle.mesh.getAbsolutePosition().x;
                this.ball.position.z = 1.6;
            }
            reslutVec = this.ball.physicsImpostor.getLinearVelocity().normalize().multiply(this.speedVec);
            this.ball.physicsImpostor.setLinearVelocity(reslutVec);
        });


        this.ball.physicsImpostor.registerOnPhysicsCollide(this.wallBot.physicsImpostor, () => {
            this.scene.onBeforeRenderObservable.remove(this.ballObserever);
            clearInterval(this.intervalUpdateSpeed);
            this.scene.onAfterPhysicsObservable.addOnce(() => {
                this.ball.dispose();
                globalThis.dispatchEvent(GAME_EVENT('Ball', ballId));
                this.ballsArray[this.ind] = undefined;
                this.ballsOnBoard.dec();
                if (this.ballsOnBoard.get() <= 0) {
                    this.reduceLives();
                    console.log('send inf before gameOver');
                    this.sendInformation();

                    if (this.isGameOver()) {
                        this.forceGameOver.bind(this.context)();
                    } else {
                        this.setBall();
                    }
                }

            });
        });

        this.registerBallPhysicImpostor();
        if (!isFirstTime) globalThis.dispatchEvent(GAME_EVENT('spawnBall'));
    }


    registerBallPhysicImpostor(): void {
        this.ball.physicsImpostor.registerOnPhysicsCollide(this.paddle.paddleImpostors, () => {
            if (this.ball.physicsImpostor.getLinearVelocity().z > 0) {
                const hitPoint = this.ball.getAbsolutePosition(); // hit point сложно получить по этому центр мяча
                const paddleCenter = this.paddle.mesh.getAbsolutePosition().x;
                let diff = (hitPoint.x - paddleCenter) / +(this.paddle.mesh.scaling.x / 2);
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
                } else {
                    resVec.set(-Math.abs(rebound * diff), this.ball.physicsImpostor.getLinearVelocity().y,
                        -Math.sqrt(this.speed ** 2 - diff ** 2 * rebound ** 2));
                }
                this.ball.physicsImpostor.setLinearVelocity(resVec);
            } else {
                const {x, y, z} = this.ball.physicsImpostor.getLinearVelocity();
                const norm = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
                const resVec = Vector3.Zero();
                resVec.set(x, y, z);
                resVec.scale(this.speed / norm);
                this.ball.physicsImpostor.setLinearVelocity(resVec);
            }
        });

        this.collideFuncZ = () => {
            if (this?.ball?.physicsImpostor?.getLinearVelocity()) {
                let vec = this.ball.physicsImpostor.getLinearVelocity();
                let delta = 0.52;
                if (vec.z < delta && vec.z > 0) {
                    let nVec = new Vector3(Math.sqrt(this.speedVec.x ** 2 - delta ** 2), vec.y, delta);
                    this.ball.physicsImpostor.setLinearVelocity(nVec);
                    return;
                }
                if (vec.z > -delta && vec.z <= 0) {
                    let nVec = new Vector3(Math.sqrt(this.speedVec.x ** 2 - delta ** 2), vec.y, -delta);
                    this.ball.physicsImpostor.setLinearVelocity(nVec);
                    return;
                }
            }
        };

        this.collideFuncX = () => {
            if (this?.ball?.physicsImpostor?.getLinearVelocity()) {
                let delta = 0.52;
                let vec = this.ball.physicsImpostor.getLinearVelocity();
                if (vec.x < delta && vec.x > 0) {
                    let nVec = new Vector3(delta, vec.y, Math.sqrt(this.speedVec.z ** 2 - delta ** 2));
                    this.ball.physicsImpostor.setLinearVelocity(nVec);
                    return;
                }
                if (vec.x > -delta && vec.x <= 0) {
                    let nVec = new Vector3(-delta, vec.y, Math.sqrt(this.speedVec.z ** 2 - delta ** 2));
                    this.ball.physicsImpostor.setLinearVelocity(nVec);
                    return;
                }
            }
        };

        this.ball.physicsImpostor.registerOnPhysicsCollide(this.wallRight.physicsImpostor, this.collideFuncZ);
        this.ball.physicsImpostor.registerOnPhysicsCollide(this.wallLeft.physicsImpostor, this.collideFuncZ);
        this.ball.physicsImpostor.registerOnPhysicsCollide(this.wallTop.physicsImpostor, this.collideFuncX);

    }

    loadScene() {
        this.wallMat = new StandardMaterial("green", this.scene);
        this.wallMat.alpha = 0;
        this.wallMat.freeze();

        this.wallLeft = MeshBuilder.CreateBox('wallLeft', {width: 20, height: 1, depth: 12}, this.scene);
        this.wallLeft.material = this.wallMat;
        this.wallLeft.physicsImpostor = new PhysicsImpostor(this.wallLeft, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallLeft.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.WALLS;
        this.wallLeft.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BALLS;
        this.wallLeft.physicsImpostor = this.wallLeft.physicsImpostor.wakeUp();
        this.wallLeft.position = new Vector3(11.9, 0, -2.5);

        this.wallRight = MeshBuilder.CreateBox('wallRight', {width: 20, height: 1, depth: 12}, this.scene);
        this.wallRight.material = this.wallMat;
        this.wallRight.physicsImpostor = new PhysicsImpostor(this.wallRight, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallRight.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.WALLS;
        this.wallRight.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BALLS;
        this.wallRight.physicsImpostor = this.wallRight.physicsImpostor.wakeUp();
        this.wallRight.position = new Vector3(-11.9, 0, -2.5);

        this.wallBot = MeshBuilder.CreateBox('wallBot', {width: 20, height: 1, depth: 10}, this.scene);
        this.wallBot.material = this.wallMat;
        this.wallBot.physicsImpostor = new PhysicsImpostor(this.wallBot, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallBot.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.WALLS;
        this.wallBot.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BALLS | COLLISION_GROUPS.BONUSES;
        this.wallBot.physicsImpostor.wakeUp();
        this.wallBot.position = new Vector3(0, 0, 12.5);
        this.wallBot.rotate(new Vector3(0, 1, 0), 1.57);

        this.wallTop = MeshBuilder.CreateBox('wallTop', {width: 20, height: 1, depth: 10}, this.scene);
        this.wallTop.material = this.wallMat;
        this.wallTop.physicsImpostor = new PhysicsImpostor(this.wallTop, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallTop.physicsImpostor.physicsBody.collisionFilterGroup = COLLISION_GROUPS.WALLS;
        this.wallTop.physicsImpostor.physicsBody.collisionFilterMask = COLLISION_GROUPS.BALLS | COLLISION_GROUPS.BONUSES | COLLISION_GROUPS.BULLETS;
        this.wallTop.physicsImpostor.wakeUp();
        this.wallTop.position = new Vector3(0, 0, -15.3);
        this.wallTop.rotate(new Vector3(0, 1, 0), 1.57);

        //generate cubes
        this.cubeMat = new StandardMaterial("red", this.scene);
        this.cubeMat.diffuseColor = new Color3(1, 0, 0);
        this.cubeMat.alpha = 1;
        this.cubeMat.freeze();

        this.generateBoardOfCubes(this.cubesMap);

        //add paddle

        this.paddleMat = new StandardMaterial("blue", this.scene);
        this.paddleMat.diffuseColor = new Color3(0, 0, 1);
        this.paddleMat.alpha = 1;
        this.paddleMat.freeze();


        console.log('paddle constructor in main');
        this.paddle = new Paddle(this.minPaddleScaling, this.maxPaddleScaling, this.paddleMaterial, this.scene);
        this.paddle.init();

        this.translatePosition();
        this.setBall(true);

        this.scene.onDisposeObservable.add(() => {
            this.ballsArray = [];
            this.ballsMeshArray = [];
            this.bulletsArray = [];
            this.cubesArray = [];
            this.ballsAdvancedTextureArray = [];
            this.optimizer.dispose();
        })

        // setInterval(() => {
        //     console.log(this.wallLeft.material);
        // }, 10000);
        if (this.isBot) {
            console.log('botReady');
            localStorage.setItem('botReady', 'true');
        } else {
            console.log('playerReady');
            localStorage.setItem('playerReady', 'true');
        }
        if (localStorage.getItem('botReady') === 'true' && localStorage.getItem('playerReady') === 'true' && localStorage.getItem('gameReady') === 'true') {
            console.log('dispatched', this.wallRight.physicsImpostor);
            setTimeout(() => {
                localStorage.setItem('isGameReady', 'true');
                globalThis.dispatchEvent(new Event('gameIsReady'))
            }, 3000);
        }
    }


    async getParams(): Promise<void> {
        this.secondsCounter.setValue(localStorage.getItem('time') === null ? 60 : +localStorage.getItem('time'));
        this.speed = localStorage.getItem('startSpeed') === null ? 7 : +localStorage.getItem('startSpeed') * 7;
        this.speedBonus = localStorage.getItem('speedBonus') === null ? 0.06 : +localStorage.getItem('speedBonus') / 100;
        this.lives = localStorage.getItem('lives') === null ? 2 : +localStorage.getItem('lives');
        this.livesCounter.setValue(this.lives);
        this.maxSpeed = localStorage.getItem('maxSpeed') === null ? 1.5 : +localStorage.getItem('maxSpeed');
        this.showBonus = localStorage.getItem('showBonus') === null ? true : Boolean(+localStorage.getItem('showBonus'));
    }

    async downloadGUI(): Promise<void> {
        let advancedTexture;
        if (this.isBot) {
            advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('GUI', false, this.scene);
        } else {
            advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('GUI', true, this.scene);
        }
        const loadedGUI = await advancedTexture.parseFromSnippetAsync('SSQKRU#64');
        this.scoreValue = advancedTexture.getControlByName('Score');
        this.time = advancedTexture.getControlByName('Time');
        this.targetValue = advancedTexture.getControlByName('Target');
        this.livesGui.push(advancedTexture.getControlByName('Live1'));
        this.livesGui.push(advancedTexture.getControlByName('Live2'));
        this.livesGui.push(advancedTexture.getControlByName('Live3'));
        this.livesGui.push(advancedTexture.getControlByName('Live4'));
        this.livesGui.push(advancedTexture.getControlByName('Live5'));
        if (!this.isBot) {
            this.exitButton = advancedTexture.getControlByName('bExit');
            this.exitButton.onPointerClickObservable.add(() => {
                globalThis.dispatchEvent(new CustomEvent("Forfeit"));
            });
        }
        for (let i = 0; i < this.livesGui.length; i++) {
            if (i < this.lives) {
                this.livesGui[i].background = '#54F8C0';
            } else {
                this.livesGui[i].background = "black"
            }
            this.livesGui[i].color = "#54F8C0";
            this.livesGui[i].thickness = 1;
        }
        this.livesValue = advancedTexture.getControlByName('Lives');
        if (this.livesValue instanceof TextBlock) {
            this.livesValue.text = this.livesValue.text.substring(0, 7) + this.lives + '';
        }
    }

    async downloadBackground(): Promise<void> {
        this.assetsManager = new AssetsManager(this.scene);

        let taskBlock1 = this.assetsManager.addTextureTask('block1', 'images/block1.png');
        taskBlock1.onSuccess = (task) => {
            this.block1 = new StandardMaterial('block1Mat', this.scene);
            this.block1.diffuseTexture = task.texture;
            this.block1.diffuseTexture.hasAlpha = true;
        };

        let taskBlock2 = this.assetsManager.addTextureTask('block2', 'images/block2.png');
        taskBlock2.onSuccess = (task) => {
            this.block2 = new StandardMaterial('block2Mat', this.scene);
            this.block2.diffuseTexture = task.texture;
            this.block2.diffuseTexture.hasAlpha = true;
        };

        let taskBlock3 = this.assetsManager.addTextureTask('block3', 'images/block3.png');
        taskBlock3.onSuccess = (task) => {
            this.block3 = new StandardMaterial('block3Mat', this.scene);
            this.block3.diffuseTexture = task.texture;
            this.block3.diffuseTexture.hasAlpha = true;
        };

        let taskBackground;
        if (this.isBot) {
            taskBackground = this.assetsManager.addTextureTask('background', 'images/backgroundBot.png', true);
        } else {
            taskBackground = this.assetsManager.addTextureTask('background', 'images/background.jpg', true);
        }
        taskBackground.onSuccess = (task) => {
            this.backgroundMaterial = new StandardMaterial('background', this.scene);
            this.backgroundMaterial.diffuseTexture = task.texture;
            this.ground.material = this.backgroundMaterial;
            this.ground.rotate(new Vector3(0, 1, 0), -1.57);
            this.ground.position = new Vector3(-0.5, 0, -1.5);
        };


        let taskPlusSize = this.assetsManager.addTextureTask('plusSize', 'images/plusSize.png');
        taskPlusSize.onSuccess = (task) => {
            this.plusSizeMaterial = new StandardMaterial('plusSize', this.scene);
            this.plusSizeMaterial.diffuseTexture = task.texture;
        };


        let taskSuperBall = this.assetsManager.addTextureTask('superBall', 'images/superBall.png');
        taskSuperBall.onSuccess = (task) => {
            this.superBallMaterial = new StandardMaterial('superBall', this.scene);
            this.superBallMaterial.diffuseTexture = task.texture;
        };

        let taskDoubleBall = this.assetsManager.addTextureTask('doubleBall', 'images/doubleBall.png');
        taskDoubleBall.onSuccess = (task) => {
            this.doubleBallMaterial = new StandardMaterial('doubleBall', this.scene);
            this.doubleBallMaterial.diffuseTexture = task.texture;
        };

        let taskMinusSize = this.assetsManager.addTextureTask('minusSize', 'images/minusSize.png');
        taskMinusSize.onSuccess = (task) => {
            this.minusSizeMaterial = new StandardMaterial('minusSize', this.scene);
            this.minusSizeMaterial.diffuseTexture = task.texture;
        };

        let taskPaddle = this.assetsManager.addTextureTask('paddle', 'images/paddle.png');
        taskPaddle.onSuccess = (task) => {
            this.paddleMaterial = new StandardMaterial('paddle', this.scene);
            task.texture.wAng = 1.57;
            this.paddleMaterial.diffuseTexture = task.texture;
        };

        let taskBulletBonus = this.assetsManager.addTextureTask('bulletBonus', 'images/bulletBonus.png');
        taskBulletBonus.onSuccess = (task) => {
            this.bulletBonusMaterial = new StandardMaterial('bulletBonus', this.scene);
            this.bulletBonusMaterial.diffuseTexture = task.texture;
        };

        let taskBullet = this.assetsManager.addTextureTask('bullet', 'images/bullet.png');
        taskBullet.onSuccess = (task) => {
            this.bulletMaterial = new StandardMaterial('bullet', this.scene);
            this.bulletMaterial.diffuseTexture = task.texture;
        };

        let taskEnergy = this.assetsManager.addTextureTask('energy', 'images/energy.png');
        taskEnergy.onSuccess = (task) => {
            this.energyMaterial = new StandardMaterial('energy', this.scene);
            this.energyMaterial.diffuseTexture = task.texture;
        };

        let taskExtraLive = this.assetsManager.addTextureTask('extraLive', 'images/extraLive.png');
        taskExtraLive.onSuccess = (task) => {
            this.extraLiveMaterial = new StandardMaterial('extraLive', this.scene);
            this.extraLiveMaterial.diffuseTexture = task.texture;
        };

        this.assetsManager.useDefaultLoadingScreen = false;
        SceneLoader.ShowLoadingScreen = false;
        this.assetsManager.load();
        this.assetsManager.onFinish = (tasks) => {
            this.loadScene();
            console.log('loaded');
        };

    }

    translatePosition() {
        if (!this.isBot) {
            this.posObserever = this.scene.onBeforeRenderObservable.add(() => {
                const positions = this.ballsMeshArray.map(el => ({
                    x: el.getAbsolutePosition().x,
                    z: el.getAbsolutePosition().z
                }));
                globalThis.dispatchEvent(GAME_EVENT('ballPosition', JSON.stringify(positions)));
            })
        }
    }


    async init(): Promise<void> {
        window.CANNON = require('cannon');
        // create the canvas html element and attach it to the webpage

        // initialize babylon scene and engine
        this.scene = new Scene(this.engine);
        this.engine.setHardwareScalingLevel(1);
        this.scene.enablePhysics(new Vector3(0, 0, 0), new CannonJSPlugin());
        this.scene.blockMaterialDirtyMechanism = true;
        const light = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        console.log('light intesity: ', light.intensity);
        light.intensity = 2;
        if (!this.isBot) {
            this.ground = MeshBuilder.CreateBox("ground", {width: 10.03, height: 0.01, depth: 5.55}, this.scene);
        } else {
            console.log('bot');
            this.ground = MeshBuilder.CreateBox("ground", {width: 9, height: 0.01, depth: 4.6}, this.scene);
        }
        this.optimizerOptions = new SceneOptimizerOptions(60, 500);
        this.optimizerOptions.optimizations.push(new TextureOptimization(0, 512));
        this.optimizerOptions.optimizations.push(new MergeMeshesOptimization(0));
        this.optimizerOptions.optimizations.push(new ShadowsOptimization(0));
        this.optimizerOptions.optimizations.push(new LensFlaresOptimization(0));
        this.optimizerOptions.optimizations.push(new PostProcessesOptimization(0));
        this.optimizerOptions.optimizations.push(new ParticlesOptimization(0));
        this.optimizerOptions.optimizations.push(new RenderTargetsOptimization(1));
        this.optimizerOptions.optimizations.push(new HardwareScalingOptimization(1, 2));
        this.optimizer = new SceneOptimizer(this.scene, this.optimizerOptions);
        this.optimizer.start();


        this.simpleBlock = await MeshBuilder.CreateBox('box', {width: 0.38, height: 0.6, depth: 0.38}, this.scene);
        this.simpleBlock.setAbsolutePosition(new Vector3(0, -5, 0));

        this.whiteBlockMaterial = new StandardMaterial('whiteMat', this.scene);
        this.orangeBlockMaterial = new StandardMaterial('orangeMat', this.scene);
        this.redBlockMaterial = new StandardMaterial('redMat', this.scene);
        this.greenBonusMaterial = new StandardMaterial('greenMat', this.scene);
        this.lightgreyMaterial = new StandardMaterial('lightgreyMat', this.scene);

        const whiteADT = new AdvancedDynamicTexture('whiteADT');
        whiteADT.background = "white";
        this.whiteBlockMaterial.diffuseTexture = whiteADT;

        const orangeADT = new AdvancedDynamicTexture('orangeADT');
        orangeADT.background = "orange";
        this.orangeBlockMaterial.diffuseTexture = orangeADT;

        const redADT = new AdvancedDynamicTexture('redADT');
        redADT.background = "red";
        this.redBlockMaterial.diffuseTexture = redADT;

        const greenADT = new AdvancedDynamicTexture('greenADT');
        greenADT.background = "green";
        this.greenBonusMaterial.diffuseTexture = greenADT;

        const lightgreyADT = new AdvancedDynamicTexture('lightgreyADT');
        lightgreyADT.background = "lightgrey";
        this.lightgreyMaterial.diffuseTexture = lightgreyADT;

        this.ballMaterial = this.lightgreyMaterial;

        await this.getParams();
        await this.downloadGUI();
        await this.downloadBackground();

        this.timeInterval = setInterval(() => {
            if (this.time instanceof TextBlock) this.time.text = this.secondsCounter.get().toFixed(1);
            if (this.secondsCounter.get() <= 0) {
                clearInterval(this.timeInterval);
            }
        }, 100);


    }


    // run the main render loop
    render() {
        if (this.isBot) {
            this.scene.autoClear = false;
        }
        this.renderSceneFunc = () => {
            if (!this.paused) {
                this.scene.render();
                // @ts-ignore
                //console.log(performance.memory.usedJSHeapSize)
            }
        };
        this.engine.runRenderLoop(this.renderSceneFunc);
    }

    derender() {
        this.paused = true;
        this.scene.detachControl();
        console.log('player\'s render Loop stopped')
        console.log(this.wallLeft);
    }

    removeElements() {
        for (let i = 0; i < this.scene.meshes.length; i++) {
            if (!this.scene.meshes[i].isDisposed()) {
                this.scene.meshes[i].dispose(false, true);
                this.scene.meshes[i] = null;
            }
        }
    }

    removeEventListener() {
        window.removeEventListener("click", this.clickFunc);
        window.removeEventListener("storage", this.storageListener)
    }

    addEventListeners() {
        if (!this.isBot) {
            this.scene.onKeyboardObservable.add(kbInfo => {
                if (kbInfo.event.key === ' ' && +this.ball.physicsImpostor.getLinearVelocity().length().toFixed(2) === 0) {
                    this.shootBall();
                    globalThis.dispatchEvent(new Event('storage'));
                }
            });


            this.clickFunc = (event) => {
                if (+this.ball.physicsImpostor.getLinearVelocity().length().toFixed(2) === 0) {
                    this.shootBall();
                    localStorage.setItem('opponentBallReleased', 'true');
                    globalThis.dispatchEvent(new Event('storage'));
                    globalThis.dispatchEvent(new Event('shootBall'));
                }
            };

            window.addEventListener("click", this.clickFunc);
            this.scene.onDisposeObservable.add(() => {
                window.removeEventListener("click", this.clickFunc);
            })
        } else {
            this.storageListener = () => {
                if (!this.ballReleased) {
                    if (localStorage.getItem('opponentBallReleased') === 'true') {
                        this.shootBall();
                    }
                }
            };
            window.addEventListener("storage", this.storageListener);
            this.scene.onDisposeObservable.add(() => {
                window.removeEventListener("storage", this.storageListener);
            })
        }
    }


    registerMouserInputControl() {
        if (!this.isBot) {
            const func = () => {
                const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
                const curPaddlePos = this.paddle.mesh.getAbsolutePosition();
                localStorage.setItem('paddlePositionX', curPaddlePos.x.toString());
                if (pickResult.hit) {
                    let pos = pickResult.pickedPoint.x;
                    if (pickResult.pickedPoint.x >= this.paddle.paddleMaxDeviation) {
                        pos = this.paddle.paddleMaxDeviation;
                    }
                    if (pickResult.pickedPoint.x <= -this.paddle.paddleMaxDeviation) {
                        pos = -this.paddle.paddleMaxDeviation;
                    }
                    const curPos = this.paddle.mesh.getAbsolutePosition();
                    globalThis.dispatchEvent(new CustomEvent('paddlePositionX', {detail: pos}));
                    this.paddle.mesh.setAbsolutePosition(new Vector3(pos, curPos.y, curPos.z));
                }
            };
            this.scene.registerBeforeRender(func);

            this.scene.onDisposeObservable.add(() => {
                this.scene.unregisterBeforeRender(func)
                console.log('unreg');
            })
        } else {
            const func = () => {
                this.findBotPaddlePosition();
            };
            this.scene.registerBeforeRender(func);
            this.scene.onDisposeObservable.add(() => {
                this.scene.unregisterBeforeRender(func);
            })
        }
    }


    findBotPaddlePosition() {
        console.log('find')
        let ContactY = 1.9 - 0.23;
        let ballDist = 100;
        let id = -1;
        let bestBall;
        for (let i = 0; i < this.ballsMeshArray.length; i++) {
            if (this.ballsMeshArray[i]?.physicsImpostor?.getLinearVelocity().z > 0) {
                let dist = Math.abs(Math.abs(this.ballsMeshArray[i].getAbsolutePosition().z - ContactY) - ContactY);
                if (dist < ballDist) {
                    ballDist = dist - ContactY;
                    id = i;
                    bestBall = this.ballsMeshArray[i];
                }
            }
        }

        if (id != -1) {
            console.log('id -1')
            let check = (Math.abs(ContactY - bestBall.getAbsolutePosition().z) * (bestBall.physicsImpostor.getLinearVelocity().x) / (bestBall.physicsImpostor.getLinearVelocity().z));
            let futureX = check + bestBall.getAbsolutePosition().x;
            for (let j = this.blocksArray.length - 1; j >= 0; j--) {
                if (this.blocksArray[j].durability > 0) {
                    let z = Math.abs(this.blocksArray[j].mesh.getAbsolutePosition().z - ContactY); // Y - из доки
                    let x = Math.abs(this.blocksArray[j].mesh.getAbsolutePosition().x - futureX); // X - из доки
                    let diff;
                    if (z == x) {
                        diff = 0.825;
                    } else if (x == 0) {
                        diff = 0;
                    } else {
                        let len = Math.sqrt(x ** 2 + z **2);
                        let k = 7 / len;
                        x *= k;
                        diff = x / (this.speed * 0.75);
                    }

                    let paddleX;
                    if (Math.abs(diff) <= 1) {
                        if (futureX < this.blocksArray[j].mesh.getAbsolutePosition().x) {
                            paddleX = futureX - diff * this.paddle.mesh.scaling.x / 2;
                        } else {
                            paddleX = futureX + diff * this.paddle.mesh.scaling.x / 2;
                        }
                    } else {
                        paddleX = bestBall.getAbsolutePosition().x + 0.05;
                    }

                    if (paddleX > this.paddle.paddleMaxDeviation) {
                        paddleX = this.paddle.paddleMaxDeviation;
                    }
                    if (paddleX < -this.paddle.paddleMaxDeviation) {
                        paddleX = -this.paddle.paddleMaxDeviation;
                    }
                    const curPos = this.paddle.mesh.getAbsolutePosition();
                    let paddleBotPos = new Vector3(paddleX, curPos.y, curPos.z);
                    console.log(paddleBotPos)
                    this.paddle.mesh.setAbsolutePosition(paddleBotPos);
                    break;
                }
            }
        }
    }


    async startScene() {
        this.registerMouserInputControl();
        this.addEventListeners();
        this.render();
    }
}
