import { Engine } from "babylonjs";
import { BONUS_TYPES } from "./bonus-types";
import { Counter } from "./counter";
import { CUBES_MAP } from "./func-types";
import { GameBoard } from "./game-board";

export class Player extends GameBoard {
    constructor(engine: Engine, isBot: boolean, cubesMap: CUBES_MAP,
        forceGameOver: (cubesMap?: CUBES_MAP) => void, startTimer: () => void, sendInformation: () => void, context: Object, secondsCounter: Counter, blocksCounter: Counter,
        livesCounter: Counter, scoreCounter: Counter) {
        super(engine, isBot, cubesMap, forceGameOver, startTimer, sendInformation, context, secondsCounter, blocksCounter, livesCounter,
             scoreCounter);
    }
}