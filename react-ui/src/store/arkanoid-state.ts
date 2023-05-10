import {createSlice} from "@reduxjs/toolkit";
import {SESSION_STATE} from "../utils/matchmaking/session-state";
import {MATCHMAKING_TITLE} from "../utils/matchmaking/matchmaking-title";
import {MATCHMAKING_STATUS} from "../utils/matchmaking/matchmaking-status";
import {MATCHMAKING_MESSAGE} from "../utils/matchmaking/matchmaking-message";
import {initialState} from "./initial-state";
import {roomClient} from "./room-client";
import {gameResultInterface} from "../utils/game-result/get-game-result";
import {msToMinutes} from "../utils/matchmaking/ms-to-minutes";
import {Room} from "colyseus.js";

const arkanoidState = createSlice({
    name: 'arkanoidState',
    initialState,
    reducers: {
        logIn: (state,
                {payload: {username, isGuestLogIn}}: { payload: { username: string, isGuestLogIn: boolean } }) => {
            isGuestLogIn ? state.isLoggedInAsGuest = true : state.isLoggedIn = true;
            state.username = username;
        },
        logOut: () => initialState,
        setSessionState: (state, {payload}: { payload: SESSION_STATE }) => {

            const clearMessage = () => state.matchmaking.informationMessage = initialState.matchmaking.informationMessage;
            const clearTimer = () => state.matchmaking.gameTimer = initialState.matchmaking.gameTimer;

            state.sessionState = payload;

            switch (payload) {
                case SESSION_STATE.STANDBY:
                    state.matchmaking = initialState.matchmaking;
                    break;
                case SESSION_STATE.AWAITING_OPPONENT:
                    state.matchmaking.title = MATCHMAKING_TITLE.FRIENDLY_BATTLE;
                    state.matchmaking.status = MATCHMAKING_STATUS.AWAITING_OPPONENT;
                    state.matchmaking.informationMessage = MATCHMAKING_MESSAGE.SHARE_LINK;
                    break;
                case SESSION_STATE.AWAITING_CONFIRMATION:
                    // duplicate title for a second client
                    state.matchmaking.title = MATCHMAKING_TITLE.FRIENDLY_BATTLE;
                    state.matchmaking.status = MATCHMAKING_STATUS.AWAITING_CONFIRMATION;
                    clearMessage();
                    break;
                case SESSION_STATE.READY:
                    clearTimer();
                    break;
                case SESSION_STATE.DISPOSE_ROOM_IDLE:
                    state.matchmaking.status = MATCHMAKING_STATUS.DISPOSE_ROOM;
                    state.matchmaking.informationMessage = MATCHMAKING_MESSAGE.IDLE;
                    break;
                case SESSION_STATE.DISPOSE_ROOM_UNREADY:
                    state.matchmaking.status = MATCHMAKING_STATUS.DISPOSE_ROOM;
                    state.matchmaking.informationMessage = MATCHMAKING_MESSAGE.UNREADY;
                    break;
                case SESSION_STATE.DISPOSE_ROOM_PLAYER_DISCONNECTED:
                    state.matchmaking.status = MATCHMAKING_STATUS.DISPOSE_ROOM;
                    state.matchmaking.informationMessage = MATCHMAKING_MESSAGE.DISCONNECT;
                    break;
                case SESSION_STATE.GAME_OVER:
                    // forceGameOver is not defined for the first player who ended the game
                    // @ts-ignore
                    global.forceGameOver && global.forceGameOver();
                    break;
                default:
                    break;
            }
        },
        setMatchmakingIsActive: (state, {payload}: { payload: boolean }) => {
            state.matchmaking.isActive = payload;
        },
        setGameTimer: (state, {payload}: { payload: number }) => {
            state.matchmaking.gameTimer = msToMinutes(payload);
        },
        setRoomHost: (state, {payload}: { payload: boolean }) => {
            state.matchmaking.isRoomHost = payload;
        },
        setGameRoom: (state, {payload}: { payload: Room }) => {
            state.matchmaking.gameRoom = payload;
        },
        setRoomId: (state, {payload}: { payload: string }) => {
            state.matchmaking.roomId = payload;
        },
        setRoomClients: (state, {payload}: { payload: roomClient[] }) => {
            payload.forEach((client, idx) => state.matchmaking.roomClients[idx] = {...client});
        },
        setGameResult: (state, {payload}: { payload: gameResultInterface }) => {
            state.gameResult = payload;
        }
    }
})

export default arkanoidState.reducer;
export const {
    logIn,
    logOut,
    setSessionState,
    setMatchmakingIsActive,
    setGameTimer,
    setGameRoom,
    setRoomHost,
    setRoomId,
    setRoomClients,
    setGameResult
} = arkanoidState.actions;
