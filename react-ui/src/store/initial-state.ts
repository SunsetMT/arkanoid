import {SESSION_STATE} from "../utils/matchmaking/session-state";
import {MATCHMAKING_TITLE} from "../utils/matchmaking/matchmaking-title";
import {initialStateClient, roomClient} from "./room-client";
import {Room} from "colyseus.js";

export interface State {
    isLoggedIn: boolean,
    isLoggedInAsGuest: boolean,
    username: string,
    sessionState: SESSION_STATE,
    gameResult: {
        title: {
            text: string,
            color: string
        },
        information: string
    },
    matchmaking: {
        isRoomHost: boolean,
        isActive: boolean,
        title: string,
        status: string,
        informationMessage: string,
        gameTimer: string,
        gameRoom: Room | null,
        roomId: string,
        roomClients: roomClient[]
    }
}

export const initialState: State = {
    isLoggedIn: false,
    isLoggedInAsGuest: false,
    username: '',
    sessionState: SESSION_STATE.STANDBY,
    gameResult: {
        title: {
            text: '',
            color: ''
        },
        information: ''
    },
    matchmaking: {
        isRoomHost: false,
        isActive: false,
        title: MATCHMAKING_TITLE.PVP,
        status: '',
        informationMessage: '',
        gameTimer: '',
        gameRoom: null,
        roomId: '',
        roomClients: Array.from({length: 2}, () => initialStateClient)
    }
}
