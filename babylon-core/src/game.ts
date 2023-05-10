import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {ArcRotateCamera, Camera, Engine, Vector3, Viewport} from "babylonjs";
import 'babylonjs-loaders';
import {Control} from "babylonjs-gui";
import {Counter} from "./counter";
import {BONUS_TYPES} from './bonus-types'
import {Player} from "./player";
import {CUBES_MAP} from "./func-types";
import {Translator} from "./translator";
import {PRESETS} from "./preset";

declare var require: any


export class Game {
    camera1: ArcRotateCamera;
    camera: ArcRotateCamera;
    canvas: HTMLCanvasElement;
    engine: Engine;
    cubesGenerated: number;
    cubesMap: CUBES_MAP;
    body: HTMLElement;
    showBonus: boolean = false;
    bonusCounter: number = 0;
    maxBonuses: number = 10;
    debuffCounter: number = 0;
    maxDebuffs: number = 10;
    bonusChance: number = 0.1;
    debuffChance: number = 0.1;
    maxDurability: number = 3;
    playerBlocksCounter: Counter = new Counter(0);
    botBlocksCounter: Counter = new Counter(0);
    playerScoreCounter: Counter = new Counter(0);
    botScoreCounter: Counter = new Counter(0);
    playerLivesCounter: Counter = new Counter(1);
    botLivesCounter: Counter = new Counter(1);
    secondsCounter: Counter;
    time: Control;
    isTimerStarted: boolean = false;
    timeInterval: number;
    player: Player;
    bot: Translator | Player;

    constructor() {
        window.CANNON = require('cannon');
        // create the canvas html element and attach it to the webpage

        this.cubesMap = [];
        globalThis.init = this.init.bind(this);
        localStorage.setItem('isInitReady', 'true');
        globalThis.dispatchEvent(new Event('initReady'));
    }

    setToLocalStorage(key: string, value: Object): void {
        localStorage.setItem(key, value.toString());
    }

    sendInformation() {
        this.setToLocalStorage('playerLives', this.playerLivesCounter.get());
        this.setToLocalStorage('playerScore', this.playerScoreCounter.get());
        this.setToLocalStorage('playerBlocks', this.playerBlocksCounter.get());
        globalThis.dispatchEvent(new CustomEvent('playerInfo', {
            detail: {
                playerLives: this.playerLivesCounter.get(),
                playerScore: this.playerScoreCounter.get(),
                playerBlocks: this.playerBlocksCounter.get()
            }
        }));
    }

    gameOver(cubesMap: CUBES_MAP = []): void {
        this.canvas.width = 1;
        this.canvas.height = 1;
        const ctx = this.canvas.getContext('2d');
        ctx && ctx.clearRect(0, 0, 1, 1);
        this.canvas.remove();
        this.clearGlobalScope();
        this.setToLocalStorage('timeLeft', this.secondsCounter.get());
        this.setToLocalStorage('playerBlocks', this.playerBlocksCounter.get());
        this.setToLocalStorage('playerLives', this.playerLivesCounter.get());
        this.setToLocalStorage('playerScore', this.playerScoreCounter.get());
        this.setToLocalStorage('opponentBlocks', this.botBlocksCounter.get());
        this.setToLocalStorage('opponentLives', this.botLivesCounter.get());
        this.setToLocalStorage('opponentScore', this.botScoreCounter.get());

        if (globalThis.gameOverHandler !== undefined && !cubesMap.length) {
            globalThis?.gameOverHandler();
        }
        clearInterval(this.timeInterval);
        this.player.derender();
        this.bot.derender();
        console.log('derendered');

        setTimeout(() => {
            this.player.scene.dispose();
            this.bot.scene.dispose();
            this.engine.dispose();
            this.cubesMap.length = 0;
            this.camera.dispose();
            this.camera1.dispose();
            console.log('dispose call');
        }, 100);
    }


    isBonusBlock(): boolean {
        if (this.bonusCounter >= this.maxBonuses) return false;
        if (Math.random() < this.bonusChance) {
            this.bonusCounter++;
            return true;
        }
        return false;
    }

    isDebuffBlock(): boolean {
        if (this.debuffCounter >= this.maxDebuffs) return false;
        if (Math.random() < this.debuffChance) {
            this.debuffCounter++;
            return true;
        }
        return false;
    }

    startTimer(): void {
        if (this.isTimerStarted === false) {
            this.isTimerStarted = true;
            if (localStorage.getItem('gameMode') === 'multiplayer') {
                this.timeInterval = setInterval(() => {
                    this.secondsCounter.setValue(+localStorage.getItem('gameTime') / 10);
                }, 100);
            } else {
                this.timeInterval = setInterval(() => {
                    this.secondsCounter.decSmall();
                    if (this.secondsCounter.get() <= 0) {
                        this.secondsCounter.setValue(0);
                        this.gameOver();
                    }
                }, 100)
            }
        }
    }

    getBonusType(): BONUS_TYPES {
        const rand = Math.random();
        let parts = 1 /6;
        switch (true) {
            case rand < parts:
                return BONUS_TYPES.PLUS_SIZE;
            case rand < parts * 2:
                return BONUS_TYPES.SUPER_BALL;
            case rand < parts * 3:
                return BONUS_TYPES.DOUBLE_BALL;
            case rand < parts * 4:
                return BONUS_TYPES.ENERGY;
            case rand < parts * 5:
                return BONUS_TYPES.EXTRA_LIVE;
            default:
                return BONUS_TYPES.GUN;
        }
    }

    getDebuffType(): BONUS_TYPES {
        return BONUS_TYPES.MINUS_SIZE;
    }

    clearGlobalScope() {
        globalThis.forceGameOver = undefined;
        globalThis.startGame = undefined;
        globalThis.reBuildGame = undefined;
        localStorage.setItem('isGameReady', 'false');
    }

    refreshCounters() {
        this.bonusCounter = 0;
        this.debuffCounter = 0;
    }


    tournamentMapGenerator(complexity: number, presetCubesMaps: CUBES_MAP[]) {
        let resGameMap: CUBES_MAP = [];
        let lineNum = Math.round(1.6 * complexity + 3);
        while (lineNum > 0) {
            let arr = JSON.parse(JSON.stringify(presetCubesMaps.filter(el => el.length / 10 <= lineNum)));
            const randEl = Math.floor(Math.random() * arr.length);
            resGameMap.push(...arr[randEl]);
            lineNum -= arr[randEl].length / 10;
        }

        let setBlocks = new Set<number>();
        let blocksNum = 0;
        for (let i = 0; i < resGameMap.length; i++) {
            if (resGameMap[i].genValue !== 0) {
                blocksNum++;
                setBlocks.add(i);
            }
        }
        this.cubesGenerated = blocksNum;
        let bonusCount = Math.round((-1.6 * complexity + 20.8) / 100 * blocksNum);
        let dbCount = Math.round((1.6 * complexity + 1.2) / 100 * blocksNum);

        let bonusArray: { bonus: BONUS_TYPES }[] = [];
        for (let i = 0; i < bonusCount; i++) {
            bonusArray.push({bonus: this.getBonusType()});
        }

        let dbArray: { bonus: BONUS_TYPES }[] = [];
        for (let i = 0; i < dbCount; i++) {
            dbArray.push({bonus: this.getDebuffType()});
        }

        function addBonuses(bonusCount: number, bonusArray: { bonus: BONUS_TYPES }[]) {
            for (let i = 0; i < bonusCount && setBlocks.size > 0; i++) {
                const getRandomItem = [...setBlocks][Math.floor(Math.random() * setBlocks.size)];
                resGameMap[getRandomItem].bonus = bonusArray[i].bonus;
                setBlocks.delete(getRandomItem);
            }
        }

        addBonuses(bonusCount, bonusArray);
        addBonuses(dbCount, dbArray);
        return resGameMap;
    }


    async init(cubesMap: CUBES_MAP = []) {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.getElementById('canvasField').appendChild(this.canvas);

        localStorage.setItem('isGameReady', 'false');
        localStorage.setItem('gameReady', 'false');
        localStorage.setItem('botReady', 'false');
        localStorage.setItem('playerReady', 'false');
        this.engine = new Engine(this.canvas, true);
        const minCubes = localStorage.getItem('minCubes') === null ? 20 : +localStorage.getItem('minCubes');
        let maxCubes = localStorage.getItem('maxCubes') === null ? 20 : +localStorage.getItem('maxCubes');
        maxCubes -= minCubes;
        this.bonusChance = localStorage.getItem('bonusChance') === null ? 0.4 : +localStorage.getItem('bonusChance');
        this.maxBonuses = localStorage.getItem('bonusCount') === null ? 10 : +localStorage.getItem('bonusCount');
        this.debuffChance = localStorage.getItem('debuffChance') === null ? 0.1 : +localStorage.getItem('debuffChance');
        this.maxDebuffs = localStorage.getItem('debuffCount') === null ? 10 : +localStorage.getItem('debuffCount');
        this.maxDurability = localStorage.getItem('durability') === null ? 3 : +localStorage.getItem('durability');

        if (cubesMap.length <= 0) {
            console.log('key: ', localStorage.getItem('advancedGen'));
            if (localStorage.getItem('advancedGen') === '0') {
                this.cubesGenerated = minCubes + Math.floor(Math.random() * maxCubes);
                for (let i = 0; i < this.cubesGenerated; i++) {
                    const genValue = Math.floor(Math.random() * this.maxDurability + 1);
                    let bonus = null;
                    const test = this.isBonusBlock();
                    if (test) {
                        bonus = this.getBonusType();
                    }
                    if (!test && this.isDebuffBlock()) {
                        bonus = this.getDebuffType();
                    }
                    this.cubesMap.push({genValue, bonus});
                }
            } else {
                this.cubesMap = this.tournamentMapGenerator(+localStorage.getItem('difficulty'), PRESETS);
            }

        } else {
            this.cubesMap = cubesMap;
            let cnt = 0;
            for (let i = 0; i < this.cubesMap.length; i++){
                if (this.cubesMap[i].genValue !== 0) {
                   cnt++;
                }
            }
            this.cubesGenerated = cnt;
        }

        this.botBlocksCounter.setValue(this.cubesGenerated);
        this.playerBlocksCounter.setValue(this.cubesGenerated);
        this.playerScoreCounter.setValue(0);
        this.botScoreCounter.setValue(0);
        const timeStorage = localStorage.getItem('time') === null ? 60 : +localStorage.getItem('time');
        this.secondsCounter = new Counter(timeStorage);
        this.isTimerStarted = false;
        this.refreshCounters();
        console.log(this.cubesMap);

        this.player = new Player(this.engine, false, this.cubesMap, this.gameOver, this.startTimer, this.sendInformation, this,
            this.secondsCounter, this.playerBlocksCounter, this.playerLivesCounter, this.playerScoreCounter);

        await this.player.init();
        console.log(1);
        if (localStorage.getItem('gameMode') === 'multiplayer') {
            this.bot = new Translator(this.engine, this.cubesMap);
        } else {
            this.bot = new Player(this.engine, true, this.cubesMap, this.gameOver, this.startTimer, this.sendInformation, this,
                this.secondsCounter, this.botBlocksCounter, this.botLivesCounter, this.botScoreCounter);
        }


        await this.bot.init();
        console.log(2);
        this.camera1 = new ArcRotateCamera("Camera", Math.PI / 2, 0, 15, Vector3.Zero(), this.bot.scene);
        this.camera1.viewport = new Viewport(0.782, 0.74, 0.16, 0.21);
        this.camera = new ArcRotateCamera("Camera", Math.PI / 2, 0, 15, Vector3.Zero(), this.player.scene);
        this.camera.viewport = new Viewport(0, 0, 1, 1);
        this.camera1.attachControl(this.canvas, true);
        this.camera1.mode = Camera.ORTHOGRAPHIC_CAMERA;
        this.camera1.orthoTop = 5.2;
        this.camera1.orthoBottom = -3.5;
        this.camera1.orthoLeft = -1.9;
        this.camera1.orthoRight = 1.9;
        this.camera1.inputs.clear();

        this.camera.attachControl(this.canvas, true);
        this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        this.camera.orthoTop = 6.5;
        this.camera.orthoBottom = -3.5;
        this.camera.orthoLeft = -2.3;
        this.camera.orthoRight = 3.3;
        this.camera.inputs.clear();

        console.log(this.cubesMap);
        localStorage.setItem('cubesMap', JSON.stringify(this.cubesMap));

        globalThis.startGame = async () => {
            globalThis.startGame = undefined;
            localStorage.setItem('isGameReady', 'false');
            localStorage.setItem('gameReady', 'false');
            localStorage.setItem('botReady', 'false');
            localStorage.setItem('playerReady', 'false');
            await this.player.startScene();
            await this.bot.startScene();
            this.sendInformation();
            this.startTimer();
            this.engine.resize();
        };

        globalThis.forceGameOver = () => {
            this.gameOver();
        };

        globalThis.reBuildGame = (cubesMap: CUBES_MAP = []) => {
            this.gameOver(cubesMap);
        };

        localStorage.setItem('gameReady', 'true');

        if (localStorage.getItem('botReady') === 'true' && localStorage.getItem('playerReady') === 'true' && localStorage.getItem('gameReady') === 'true') {
            console.log('dispatched from game');
            setTimeout(() => {
                localStorage.setItem('isGameReady', 'true');
                globalThis.dispatchEvent(new Event('gameIsReady'))
            }, 3000);
        }

        window.addEventListener('resize', () => {
            this.engine.resize();
        })
    }
}
