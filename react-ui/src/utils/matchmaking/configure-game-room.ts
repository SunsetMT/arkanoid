import {MESSAGE_TYPE} from "./message-type";
import {setGameRoom, setGameTimer, setRoomClients, setRoomId, setSessionState} from "../../store/arkanoid-state";
import {roomClient} from "../../store/room-client";
import {SESSION_STATE} from "./session-state";
import {store} from "../../store/store";
import {gameProperties, unsetGameResultProps} from "../game-result/game-result-props";
import {GAME_OVER_CODE, getGameResult} from "../game-result/get-game-result";
import {handleRoomEvents} from "./handle-room-events";
import {generateCubesMap} from "./generate-cubes-map";
import {Setting} from "../settings/default-settings";
import {saveSettings} from "../settings/save-settings";
import {Room} from "colyseus.js";

export const configureGameRoom = (room: Room) => {

    store.dispatch(setGameRoom(room));

    handleRoomEvents(room);

    store.dispatch(setRoomId(room.id));

    room.onStateChange(({sessionState}: { sessionState: SESSION_STATE }) => store.dispatch(setSessionState(sessionState)));

    room.onMessage(MESSAGE_TYPE.CLIENTS, (clients: roomClient[]) => store.dispatch(setRoomClients(clients)));

    room.onMessage(MESSAGE_TYPE.TIMER, (timer: number) => {
        const {arkanoidState: {sessionState}} = store.getState();
        if (sessionState === SESSION_STATE.GAME_IN_PROGRESS) {
            localStorage.setItem('gameTime', `${timer / 100}`);
        } else {
            store.dispatch(setGameTimer(timer))
        }
    });

    room.onMessage(MESSAGE_TYPE.OPPONENT_PADDLE_INPUT, (paddleInput: number) => localStorage.setItem('opponentPaddle', paddleInput.toString()));

    room.onMessage(MESSAGE_TYPE.OPPONENT_BALL_RELEASED, () => {
        localStorage.setItem('opponentBallReleased', 'true');
        global.dispatchEvent(new Event('storage'));
    });

    room.onMessage(MESSAGE_TYPE.HOST_ROOM_CONFIG, ({
                                                       gameSettings,
                                                       cubesMap
                                                   }: { gameSettings: Setting[], cubesMap: [] }) => {
        console.error('received host config');
        saveSettings(gameSettings);
        generateCubesMap(cubesMap);
    });

    room.onMessage(MESSAGE_TYPE.GAME_RESULT, ({
                                                  gameProps = unsetGameResultProps,
                                                  gameOverCode
                                              }: { gameProps: gameProperties, gameOverCode: GAME_OVER_CODE }) => {
        getGameResult(gameProps, gameOverCode);
    });

    // @ts-ignore
    global.gameOverHandler = () => room.send(MESSAGE_TYPE.GAME_OVER);
}
