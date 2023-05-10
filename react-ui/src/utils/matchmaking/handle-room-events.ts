import {Room} from "colyseus.js";
import {MESSAGE_TYPE} from "./message-type";
import {EVENT_TYPE} from "./event-type";

export const handleRoomEvents = (room: Room) => {
    const paddlePositionListener = (e: CustomEventInit<object>) => room.send(MESSAGE_TYPE.PLAYER_PADDLE_INPUT, e.detail);

    const playerInfoListener = (e: CustomEventInit<object>) => room.send(MESSAGE_TYPE.PLAYER_GAME_RESULT, e.detail);

    const gameEventListener = (e: CustomEventInit<object>) => room.send(MESSAGE_TYPE.GAME_EVENT, e.detail);

    const ballReleasedListener = () => room.send(MESSAGE_TYPE.PLAYER_BALL_RELEASED);

    window.addEventListener(EVENT_TYPE.PADDLE_POSITION, paddlePositionListener);

    window.addEventListener(EVENT_TYPE.PLAYER_INFO, playerInfoListener);

    window.addEventListener(EVENT_TYPE.GAME_EVENT, gameEventListener);

    window.addEventListener(EVENT_TYPE.BALL_RELEASED, ballReleasedListener);

    room.onMessage(MESSAGE_TYPE.OPPONENT_GAME_EVENT, ({type, payload}: { type: string, payload: number | string }) => {
        switch (type) {
            case EVENT_TYPE.DISPOSE_BLOCK:
                global.dispatchEvent(new Event(`${EVENT_TYPE.DISPATCH_DISPOSE_BLOCK}${payload}`));
                break;
            case EVENT_TYPE.CHANGE_MATERIAL:
                global.dispatchEvent(new Event(`${EVENT_TYPE.DISPATCH_CHANGE_MATERIAL}${payload}`));
                break;
            case EVENT_TYPE.ENABLE_GUN:
                global.dispatchEvent(new Event(EVENT_TYPE.DISPATCH_ENABLE_GUN));
                break;
            case EVENT_TYPE.MINUS_SIZE:
                global.dispatchEvent(new Event(EVENT_TYPE.DISPATCH_MINUS_SIZE));
                break;
            case EVENT_TYPE.PLUS_SIZE:
                global.dispatchEvent(new Event(EVENT_TYPE.DISPATCH_PLUS_SIZE));
                break;
            case EVENT_TYPE.SUPER_BALL:
                global.dispatchEvent(new Event(EVENT_TYPE.DISPATCH_SUPER_BALL));
                break;
            case EVENT_TYPE.ENERGY_BALL:
                global.dispatchEvent(new Event(EVENT_TYPE.DISPATCH_ENERGY_BALL));
                break;
            case EVENT_TYPE.SPAWN_BALL:
                global.dispatchEvent(new Event(EVENT_TYPE.DISPATCH_SPAWN_BALL));
                break;
            case EVENT_TYPE.DISPOSE_BALL:
                global.dispatchEvent(new Event(`${EVENT_TYPE.DISPATCH_DISPOSE_BALL}${payload}`));
                break;
            case EVENT_TYPE.BALL_POSITION:
                global.dispatchEvent(new CustomEvent(EVENT_TYPE.DISPATCH_BALL_POSITION, {detail: payload}));
                break;
            default:
                break;
        }
    });

    room.onLeave(() => {
        room.removeAllListeners();
        window.removeEventListener(EVENT_TYPE.PADDLE_POSITION, paddlePositionListener);
        window.removeEventListener(EVENT_TYPE.PLAYER_INFO, playerInfoListener);
        window.removeEventListener(EVENT_TYPE.GAME_EVENT, gameEventListener);
        window.removeEventListener(EVENT_TYPE.BALL_RELEASED, ballReleasedListener);
    });
}
