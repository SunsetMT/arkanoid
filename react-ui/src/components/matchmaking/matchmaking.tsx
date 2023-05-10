import {ModalWindow} from "../modal-window/modal-window";
import {setMatchmakingIsActive, setRoomHost} from "../../store/arkanoid-state";
import styles from "./matchmaking.module.scss";
import {ControlButton} from "../control-button/control-button";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {Client} from "colyseus.js";
import {configureGameRoom} from "../../utils/matchmaking/configure-game-room";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {StatusPanel} from "../status-panel/status-panel";

export const Matchmaking = () => {

    const dispatch = useAppDispatch();

    const {matchmaking, sessionState, username} = useAppSelector(state => state.arkanoidState);

    const {title, status, informationMessage, gameTimer, roomId, gameRoom} = matchmaking;

    const navigate = useNavigate();

    const {protocol} = window.location;

    const client = new Client(`${protocol.includes('s') ? 'wss' : 'ws'}://${process.env.REACT_APP_DEVELOPMENT_HOST}:${process.env.REACT_APP_SERVER_PORT}`);

    useEffect(() => {
        switch (sessionState) {
            case SESSION_STATE.STANDBY:
                roomId && joinGameSession();
                break;
            case SESSION_STATE.READY:
                navigate('/game');
                break;
            default:
                break;
        }
    }, [sessionState]);

    const createGameSession = () => {
        client.create('duel_room', {name: username})
            .then(room => {
                dispatch(setRoomHost(true));
                configureGameRoom(room);
            })
            .catch(error => alert(error));
    }

    const joinGameSession = () => {
        client.joinById(roomId, {name: username})
            .then(room => {
                dispatch(setMatchmakingIsActive(true));
                configureGameRoom(room);
            })
            .catch(error => alert(error));
    }

    const display = {
        matchmakingControls: sessionState === SESSION_STATE.STANDBY,
        statusPanel: sessionState === SESSION_STATE.AWAITING_OPPONENT || sessionState === SESSION_STATE.AWAITING_CONFIRMATION
    }

    return (
        <ModalWindow open={matchmaking.isActive}>
            <div className={styles['matchmaking']}>
                <div className={styles['matchmaking__close-icon']}
                     onClick={() => dispatch(setMatchmakingIsActive(false))}/>
                <span className={styles['matchmaking__title']}>{title}</span>
                <div className={styles['matchmaking__header']}>
                    <span className={styles['matchmaking__header__status']}>{status}</span>
                    <span className={styles['matchmaking__header__info-message']}>{informationMessage}</span>
                    <span className={styles['matchmaking__header__timer']}>{gameTimer}</span>
                </div>
                <div className={styles['matchmaking__content']}>
                    {display.statusPanel && <StatusPanel room={gameRoom!}/>}
                    {display.matchmakingControls &&
                    <div className={styles['matchmaking__content__controls']}>
                        <ControlButton action={'/'} text={'Match'} disabled={true}/>
                        <ControlButton action={() => createGameSession()} text={'Friendly Battle'}/>
                    </div>}
                </div>
            </div>
        </ModalWindow>
    )
}
