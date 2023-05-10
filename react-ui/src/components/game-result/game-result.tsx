import styles from './game-result.module.scss';
import {ControlButton} from "../control-button/control-button";
import {ModalWindow} from "../modal-window/modal-window";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {useNavigate} from "react-router-dom";
import {setSessionState} from "../../store/arkanoid-state";
import {useEffect, useState} from "react";
import {StatusPanel} from "../status-panel/status-panel";

const redirectTime = 3 * 60 * 1000;

export const GameResult = () => {

    const {
        sessionState,
        gameResult,
        matchmaking: {gameRoom: room, gameTimer: timer, informationMessage: infoMsg, status}
    } = useAppSelector(state => state.arkanoidState);

    const dispatch = useAppDispatch();

    const {t} = useTranslation('buttons');

    const navigate = useNavigate();

    const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout>();

    const showGameResult =
        sessionState !== SESSION_STATE.GAME_IN_PROGRESS
        && sessionState !== SESSION_STATE.READY
        && sessionState !== SESSION_STATE.GAME_PAUSED;

    useEffect(() => {
        sessionState === SESSION_STATE.STANDBY && setRedirectTimeout(setTimeout(() => navigate('/menu'), redirectTime));
    }, [sessionState]);

    const navigateToMenu = () => {
        room?.leave();
        sessionState !== SESSION_STATE.STANDBY && dispatch(setSessionState(SESSION_STATE.STANDBY));
        redirectTimeout && clearTimeout(redirectTimeout);
        navigate('/menu');
    }

    const {title: {text, color}, information} = gameResult;

    const gameResultTitle = 'game-result__content__header';

    return (
        <ModalWindow open={showGameResult}>
            <div className={styles['game-result']}>
                <div className={styles['game-result__content']}>
                    <div className={`${styles[gameResultTitle]} ${styles[`${gameResultTitle}-${color}`]}`}>
                        {text}
                    </div>
                    <div>
                        {information}
                    </div>
                    {timer && <div className={styles['game-result__content__replay']}>
                        <span>{`${t('playAgain')}?`}</span>
                        <span>{status}</span>
                        <span>{infoMsg}</span>
                        <span>{timer}</span>
                        <StatusPanel room={room}/>
                    </div>}
                </div>
                {!timer && <div className={styles['game-result__controls']}>
                    <ControlButton action={navigateToMenu} text={t('mainMenu')}/>
                </div>}
            </div>
        </ModalWindow>
    )
}
