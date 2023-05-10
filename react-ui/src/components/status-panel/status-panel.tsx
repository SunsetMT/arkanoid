import styles from './status-panel.module.scss';
import {StatusBar} from "../status-bar/status-bar";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {ControlButton} from "../control-button/control-button";
import {Room} from "colyseus.js";
import {MESSAGE_TYPE} from "../../utils/matchmaking/message-type";
import {setSessionState} from "../../store/arkanoid-state";
import {roomClient} from "../../store/room-client";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Setting} from "../../utils/settings/default-settings";
import {getSettings} from "../../utils/settings/get-settings";
import {generateCubesMap} from "../../utils/matchmaking/generate-cubes-map";

interface StatusPanelProps {
    room: Room
}

interface HostRoomConfig {
    gameSettings: Setting[],
    cubesMap: []
}

export const StatusPanel = ({room}: StatusPanelProps) => {

    const dispatch = useAppDispatch();

    const {pathname} = useLocation();

    const navigate = useNavigate();

    const {t} = useTranslation('buttons');

    const {sessionState, matchmaking: {isRoomHost, gameTimer}} = useAppSelector(state => state.arkanoidState);

    const clients: roomClient[] = useAppSelector(state => state.arkanoidState.matchmaking.roomClients)

    const [startButtonDisabled, setStartButtonDisabled] = useState(true);

    const [startButtonText, setStartButtonText] = useState(t('startGame'));

    useEffect(() => {
        sessionState === SESSION_STATE.AWAITING_CONFIRMATION
            ? setStartButtonDisabled(false)
            : setStartButtonDisabled(true);
    }, [sessionState]);

    const statusPanel = clients.map((client, idx) => <StatusBar client={client} key={idx}/>);

    statusPanel.splice(1, 0, <span key={'vs-span'}>VS</span>);

    const startGame = () => {
        setStartButtonDisabled(true);

        const sendPlayerReadyMessage = () => {
            const hostRoomConfig: HostRoomConfig = {
                gameSettings: getSettings(),
                cubesMap: JSON.parse(localStorage.getItem('cubesMap')!) || [],
            };
            window.removeEventListener('gameIsReady', sendPlayerReadyMessage);
            room.send(MESSAGE_TYPE.PLAYER_READY, isRoomHost ? hostRoomConfig : undefined);
            setStartButtonText(t('startGame'));
        }

        const loadGame = () => {
            if (localStorage.getItem('isGameReady') === 'true') {
                sendPlayerReadyMessage();
            } else {
                setStartButtonText(t('loading'));
                // window.addEventListener('gameIsReady', sendPlayerReadyMessage);
                window.addEventListener('gameIsReady', sendPlayerReadyMessage)
            }
        }
        isRoomHost && generateCubesMap();
        loadGame();
    }

    const leaveSession = () => {
        room ?
            room.leave().then(() => dispatch(setSessionState(SESSION_STATE.STANDBY)))
            :
            // force STANDBY state
            window.location.reload();
        pathname.includes('game') && navigate('/menu');
    }

    return (
        <div className={styles['status-panel']}>
            {statusPanel}
            <div className={styles['status-panel__controls']}>
                <ControlButton action={() => startGame()} text={startButtonText} disabled={startButtonDisabled}/>
                {gameTimer && <ControlButton action={() => leaveSession()} text={t('mainMenu')}/>}
            </div>
        </div>
    )
}
