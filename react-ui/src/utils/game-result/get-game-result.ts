import {gameProperties, gameResultProps} from "./game-result-props";
import {store} from "../../store/store";
import {setGameResult} from "../../store/arkanoid-state";

export enum GAME_OVER_CODE {
    GAME_FINISHED_BY_OPPONENT,
    GAME_FINISHED_BY_PLAYER,
    DISCONNECT,
}

export enum GAME_RESULT_TITLE_COLOR {
    GREEN = 'green',
    YELLOW = 'yellow',
    RED = 'red',
    DEFAULT = ''
}

interface GameResultTitle {
    text: string,
    color: GAME_RESULT_TITLE_COLOR
}

const gameResultTitle = {
    VICTORY: {text: 'Победа', color: GAME_RESULT_TITLE_COLOR.GREEN},
    DEFEAT: {text: 'Поражение', color: GAME_RESULT_TITLE_COLOR.RED},
    DRAW: {text: 'Ничья', color: GAME_RESULT_TITLE_COLOR.DEFAULT},
    ERROR: {text: 'Ошибка', color: GAME_RESULT_TITLE_COLOR.YELLOW}
}

export interface gameResultInterface {
    title: GameResultTitle,
    information: string
}

const gameResultInformation = {
    ZERO_BLOCKS: {
        playerWins: (opponentBlocks: number) => `Вы разбили все свои блоки.\n Количество оставшихся блоков противника: ${opponentBlocks}`,
        opponentWins: (playerBlocks: number) => `Противник разбил все свои блоки.\n Количество оставшихся у вас блоков: ${playerBlocks}`
    },
    ZERO_LIVES: {
        playerWins: (playerLives: number) => `У противника закончились жизни.\n Количество оставшихся у вас жизней: ${playerLives}`,
        opponentWins: (opponentLives: number) => `У вас закончились жизни.\n Количество оставшихся жизней противника: ${opponentLives}`
    },
    ZERO_TIME: (playerScore: number, opponentScore: number) => (
        `Время вышло.\n Количество набранных вами очков: ${playerScore}\n Количество очков противника: ${opponentScore}`
    ),
    DISCONNECT: 'Ваш противник отключился',
    PLAYER_SURRENDERED: 'Вы сдались',
    OPPONENT_SURRENDERED: 'Ваш противник сдался',
    ERROR: 'Не удалось получить результаты матча'
}

export const getGameResult = (gameProps: gameProperties = gameResultProps(), gameOverCode: GAME_OVER_CODE = 1) => {

    const result: gameResultInterface = {
        title: gameResultTitle.ERROR,
        information: gameResultInformation.ERROR
    };

    switch (gameOverCode) {
        case GAME_OVER_CODE.DISCONNECT:
            result.title = gameResultTitle.VICTORY;
            result.information = gameResultInformation.DISCONNECT;
            break;
        default:
            if (Object.values(gameProps).every(propertyValue => propertyValue > -1)) {
                const {
                    timeLeft,
                    playerBlocks,
                    playerLives,
                    playerScore,
                    opponentBlocks,
                    opponentLives,
                    opponentScore
                } = gameProps;

                if (!timeLeft && playerBlocks > 0 && opponentBlocks > 0) {
                    if (playerScore > opponentScore) {
                        result.title = gameResultTitle.VICTORY;
                    } else if (playerScore < opponentScore) {
                        result.title = gameResultTitle.DEFEAT
                    } else {
                        result.title = gameResultTitle.DRAW;
                    }
                    result.information = gameResultInformation.ZERO_TIME(playerScore, opponentScore);
                } else if (!playerBlocks || !opponentBlocks) {
                    if (!playerBlocks) {
                        result.title = gameResultTitle.VICTORY;
                        result.information = gameResultInformation.ZERO_BLOCKS.playerWins(opponentBlocks);
                    } else {
                        result.title = gameResultTitle.DEFEAT;
                        result.information = gameResultInformation.ZERO_BLOCKS.opponentWins(playerBlocks);
                    }
                } else if (!playerLives || !opponentLives) {
                    if (!playerLives) {
                        result.title = gameResultTitle.DEFEAT;
                        result.information = gameResultInformation.ZERO_LIVES.opponentWins(opponentLives);
                    } else {
                        result.title = gameResultTitle.VICTORY;
                        result.information = gameResultInformation.ZERO_LIVES.playerWins(playerLives);
                    }
                } else if (gameOverCode === GAME_OVER_CODE.GAME_FINISHED_BY_PLAYER) {
                    result.title = gameResultTitle.DEFEAT;
                    result.information = gameResultInformation.PLAYER_SURRENDERED;
                } else if (gameOverCode === GAME_OVER_CODE.GAME_FINISHED_BY_OPPONENT) {
                    result.title = gameResultTitle.VICTORY;
                    result.information = gameResultInformation.OPPONENT_SURRENDERED;
                }
            }
            break;
    }

    // if result is unset (unhandled game result properties combination) or properties are invalid returns an error
    store.dispatch(setGameResult(result));
}
