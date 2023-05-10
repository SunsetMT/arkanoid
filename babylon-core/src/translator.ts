import {
    AssetsManager,
    CannonJSPlugin,
    Color3,
    Engine,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PhysicsImpostor,
    Scene,
    StandardMaterial,
    Texture,
    Vector3,
    SceneLoader
} from "babylonjs";
import {AdvancedDynamicTexture, Control, TextBlock, Style} from "babylonjs-gui";
import {Ball} from "./ball";
import {Counter} from "./counter";
import {Gun} from "./gun";
import {BONUS_TYPES} from './bonus-types'
import {Block} from "./block";
import {BonusBlock} from "./bonus-block";
import {Paddle} from "./paddle";
import {CUBES_MAP} from "./func-types";

declare var require: any

export class Translator {


    scene: Scene;
    engine: Engine;
    cubesMap: CUBES_MAP;
    ground: Mesh;
    bonusTexture: Texture;
    plusSizeMaterial: StandardMaterial;
    superBallMaterial: StandardMaterial;
    doubleBallMaterial: StandardMaterial;
    minusSizeMaterial: StandardMaterial;
    energyMaterial: StandardMaterial;
    paddleMaterial: StandardMaterial;
    bulletBonusMaterial: StandardMaterial;
    bulletMaterial: StandardMaterial;
    extraLiveMaterial: StandardMaterial;
    wallMat: StandardMaterial;
    wallLeft: any;
    wallRight: Mesh;
    wallBot: Mesh;
    wallTop: any;
    cubeMat: any;
    paddleMat: StandardMaterial;
    paddle: Paddle;
    renderSceneFunc: () => void;
    cubesCounter: number;
    cubesGenerated: number;
    cubesSetted: number = 0;
    ballsMeshArray: Mesh[] = [];
    ballId: number = 1;
    superBallInterval: number;
    gunIntervalId: Counter = new Counter(0);
    cubesArray: PhysicsImpostor[] = [];
    isSuperBall: boolean = false;
    isEnergyBall: boolean = false;
    simpleBlock: Mesh;
    block1: StandardMaterial;
    block2: StandardMaterial;
    block3: StandardMaterial;
    backgroundMaterial: StandardMaterial;
    assetsManager: AssetsManager;

    constructor(engine: Engine, cubesMap: CUBES_MAP) {
        this.engine = engine;
        this.cubesMap = cubesMap;
    }

    generateCube(x: number, z: number, cubesMap: CUBES_MAP): void {
        if (cubesMap[this.cubesSetted].genValue === 0) {
            this.cubesSetted++;
            return;
        }
        const block = new Block(x, z, cubesMap[this.cubesSetted].bonus, cubesMap[this.cubesSetted].genValue,
            false, this.scene, this.simpleBlock, true);
        block.init();
        block.changeMaterial(this.block1, this.block2, this.block3);
        this.cubesSetted++;
        const cubeNum = this.cubesSetted;
        this.cubesArray.push(block.mesh.physicsImpostor);
        const destroyCube = () => {
            block.destroyCube();
        };

        const changeMaterialListener = () => {
            block.durability--;
            block.changeMaterial(this.block1, this.block2, this.block3);
        };
        window.addEventListener(`opponentChangeMaterial${cubeNum}`, changeMaterialListener);

        const disposeBlockListener = () => {
            destroyCube();
            if (block.bonusType) {
                this.generateBonus(block.mesh.getAbsolutePosition(), block.bonusType);
            }
        };
        window.addEventListener(`disposeBlock${cubeNum}`, disposeBlockListener);

        this.scene.onDisposeObservable.add(() => {
            window.removeEventListener(`disposeBlock${cubeNum}`, disposeBlockListener);
        });


    }

    generateRowOfCubes(cubesInRow: number, rowPositionZ: number, cubesMap: CUBES_MAP): void {
        let x = 1.8;
        for (let i = 0; i < cubesInRow; i++) {
            this.generateCube(x, rowPositionZ, cubesMap);
            x -= 0.4;
        }
    }

    generateBoardOfCubes(cubesMap: CUBES_MAP): void {
        let cnt = 0;
        for(let i = 0; i < cubesMap.length; i++) {
            if(cubesMap[i].genValue !== 0) {
                cnt++;
            }
        }
        this.cubesCounter = this.cubesGenerated = cnt;
        const numOfRows = Math.floor(cubesMap.length / 10);
        const lastRowNum = cubesMap.length % 10;
        let rowPositionZ = -5.09;
        for (let i = 0; i < numOfRows; i++) {
            this.generateRowOfCubes(10, rowPositionZ, cubesMap);
            rowPositionZ += 0.4;
        }
        this.generateRowOfCubes(lastRowNum, rowPositionZ, cubesMap);
    }


    generateBonus(position: Vector3, type: BONUS_TYPES) {
        const bonusBlock = new BonusBlock(position, type, this.scene, this.plusSizeMaterial, this.superBallMaterial,
            this.doubleBallMaterial, this.bulletBonusMaterial, this.minusSizeMaterial, this.energyMaterial, this.extraLiveMaterial);
        bonusBlock.init();

        bonusBlock.mesh.physicsImpostor.registerOnPhysicsCollide([...this.paddle.paddleImpostors, this.wallBot.physicsImpostor], () => {
            this.scene.onAfterPhysicsObservable.addOnce(() => bonusBlock.mesh.dispose());
        });


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
        taskBackground = this.assetsManager.addTextureTask('background', 'images/backgroundBot.png', true);

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
    }


    setBall(): void {
        const ball = MeshBuilder.CreateSphere('ball', {diameter: 0.26}, this.scene);
        const ballID = this.ballId;
        this.ballId++;
        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(ball);
        advancedTexture.background = 'lightgrey';
        if (this.isSuperBall) {
            advancedTexture.background = 'red';
        }
        this.ballsMeshArray.push(ball);
        const disposeBallListener = () => {
            this.scene.onAfterPhysicsObservable.addOnce(() => {
                ball.dispose();
            })
        };

        window.addEventListener(`disposeBall${ballID}`, disposeBallListener);

        this.scene.onDisposeObservable.add(() => {
            window.removeEventListener(`disposeBall${ballID}`, disposeBallListener);
        });

    }


    async init() {
        window.CANNON = require('cannon');
        // create the canvas html element and attach it to the webpage

        // initialize babylon scene and engine
        this.scene = new Scene(this.engine);
        this.engine.setHardwareScalingLevel(1);
        this.scene.enablePhysics(new Vector3(0, 0, 0), new CannonJSPlugin());
        this.scene.blockMaterialDirtyMechanism = true;
        new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        this.ground = MeshBuilder.CreateBox("ground", {width: 10, height: 0.01, depth: 4.6}, this.scene);
        this.simpleBlock = await MeshBuilder.CreateBox('box', { width: 0.4, height: 2, depth: 0.4 }, this.scene);
        this.simpleBlock.setAbsolutePosition(new Vector3(0, -5, 0));
        await this.downloadBackground();
        await new Promise(r => setTimeout(r, 2000));

        this.wallMat = new StandardMaterial("green", this.scene);
        this.wallMat.alpha = 0;
        this.wallMat.freeze();

        this.wallLeft = MeshBuilder.CreateBox('wallLeft', {width: 20, height: 1, depth: 12}, this.scene);
        this.wallLeft.material = this.wallMat;
        this.wallLeft.physicsImpostor = new PhysicsImpostor(this.wallLeft, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallLeft.position = new Vector3(12, 0, -2.5);

        this.wallRight = MeshBuilder.CreateBox('wallRight', {width: 20, height: 1, depth: 12}, this.scene);
        this.wallRight.material = this.wallMat;
        this.wallRight.physicsImpostor = new PhysicsImpostor(this.wallRight, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallRight.position = new Vector3(-12, 0, -2.5);

        this.wallBot = MeshBuilder.CreateBox('wallBot', {width: 20, height: 10, depth: 100}, this.scene);
        this.wallBot.material = this.wallMat;
        this.wallBot.physicsImpostor = new PhysicsImpostor(this.wallBot, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
        this.wallBot.position = new Vector3(0, 0, 13.335);
        this.wallBot.rotate(new Vector3(0, 1, 0), 1.57);

        this.wallTop = MeshBuilder.CreateBox('wallTop', {width: 20, height: 1, depth: 10}, this.scene);
        this.wallTop.material = this.wallMat;
        this.wallTop.physicsImpostor = new PhysicsImpostor(this.wallTop, PhysicsImpostor.BoxImpostor,
            {mass: 0, restitution: 1, friction: 0});
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


        this.paddle = new Paddle(0, 0, this.paddleMaterial, this.scene); // зачем первые 2 праметра?
        this.paddle.init();

        //this.translatePosition();
        this.setBall();

        const opponentPlusSizeListener = () => {
            this.paddle.plusSize();
        };

        const opponentMinusSizeListener = () => {
            this.paddle.minusSize();
        };

        const opponentSpawnBallListener = () => {
            this.setBall();
        };

        const opponentSuperBallListener = () => {
            this.isSuperBall = true;
            for (let i = 0; i < this.ballsMeshArray.length; i++) {
                const advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.ballsMeshArray[i]);
                advancedTexture.background = 'red';
            }
            this.superBallInterval = setTimeout(() => {
                for (let i = 0; i < this.ballsMeshArray.length; i++) {
                    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.ballsMeshArray[i]);
                    advancedTexture.background = 'lightgrey';
                }
                this.isSuperBall = false;
            }, 10000);
        };

        const opponentGunListener = () => {
            clearInterval(this.gunIntervalId.get());
            const gun = new Gun(this.paddle.mesh, this.bulletMaterial, this.cubesArray, [], this.wallTop,
                this.scene, this.gunIntervalId);
        };

        const opponentEnergyBallListener = () => {
            this.isEnergyBall = true;
            for (let i = 0; i < this.ballsMeshArray.length; i++) {
                const advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.ballsMeshArray[i]);
                advancedTexture.background = 'violet';
            }
            this.superBallInterval = setTimeout(() => {
                for (let i = 0; i < this.ballsMeshArray.length; i++) {
                    const advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.ballsMeshArray[i]);
                    advancedTexture.background = 'lightgrey';
                }
                this.isSuperBall = false;
            }, 5000);
        };


        window.addEventListener('opponentPlusSize', opponentPlusSizeListener);

        window.addEventListener('opponentMinusSize', opponentMinusSizeListener);

        window.addEventListener('opponentSpawnBall', opponentSpawnBallListener);

        window.addEventListener('opponentSuperBall', opponentSuperBallListener);

        window.addEventListener('opponentEnergyBall', opponentEnergyBallListener);

        window.addEventListener('opponentGun', opponentGunListener);

        this.scene.onDisposeObservable.add(() => {
            window.removeEventListener('opponentPlusSize', opponentPlusSizeListener);
            window.removeEventListener('opponentMinusSize', opponentMinusSizeListener);
            window.removeEventListener('opponentSpawnBall', opponentSpawnBallListener);
            window.removeEventListener('opponentSuperBall', opponentSpawnBallListener);
            window.removeEventListener('opponentGun', opponentGunListener);
            this.ballsMeshArray.length = 0;
            this.cubesArray.length = 0;
        })

        localStorage.setItem('botReady', 'true');
        if(localStorage.getItem('botReady') === 'true' && localStorage.getItem('playerReady') === 'true' && localStorage.getItem('gameReady') === 'true'){
            console.log('dispatched', this.wallRight.physicsImpostor);
            setTimeout(() => {
                localStorage.setItem('isGameReady', 'true');
                globalThis.dispatchEvent(new Event('gameIsReady'))
            }, 3000);
        }

    }


    registerPlayerClone() {
        this.scene.registerBeforeRender(() => {
            const curPaddlePos = this.paddle.mesh.getAbsolutePosition();
            let tempPaddlePos = +localStorage.getItem('opponentPaddle');
            this.paddle.mesh.setAbsolutePosition(new Vector3(tempPaddlePos, curPaddlePos.y, curPaddlePos.z));
        });
        const opponentBallPositionListener = (e: CustomEventInit) => {
            let tempBallPos = JSON.parse(e.detail);
            for (let i = 0; i < this.ballsMeshArray.length; i++) {
                this.ballsMeshArray[i].setAbsolutePosition(new Vector3(tempBallPos[i].x, 0.2, tempBallPos[i].z));
            }
        };
        window.addEventListener('opponentBallPosition', opponentBallPositionListener);

        this.scene.onDisposeObservable.add(() => {
            window.removeEventListener('opponentBallPosition', opponentBallPositionListener);
        })
    }

    render() {
        this.scene.autoClear = false;
        this.renderSceneFunc = () => {
            this.scene.render();
        };
        this.engine.runRenderLoop(this.renderSceneFunc);
    }

    derender() {
        this.engine.stopRenderLoop(this.renderSceneFunc)
    }

    async startScene() {
        this.registerPlayerClone();
        this.render();
    }
}
