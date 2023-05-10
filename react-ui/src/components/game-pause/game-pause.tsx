import styles from './game-pause.module.scss';
import {ModalWindow} from "../modal-window/modal-window";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {setSessionState} from "../../store/arkanoid-state";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {useTranslation} from "react-i18next";
import {ControlButton} from "../control-button/control-button";

export const GamePause = () => {
    // state GAME_PAUSED is not really pausing the game right now
    const sessionState = useAppSelector(state => state.arkanoidState.sessionState);

    const dispatch = useAppDispatch();

    const {t} = useTranslation(['game', 'buttons']);

    return (
        <ModalWindow open={sessionState === SESSION_STATE.GAME_PAUSED}>
            <div className={styles['game-pause']}>
                <div className={styles['game-pause__wrapper']}>
                    <div className={styles['game-pause__wrapper__title']}>
                        {t('pause')}
                    </div>
                    <div className={styles['game-pause__wrapper__content']}>
                        {t('finishGame')}
                        <div className={styles['game-pause__wrapper__content__controls']}>
                            <ControlButton
                                // @ts-ignore
                                action={() => global.forceGameOver()}
                                text={t('yes', {ns: 'buttons'})}/>
                            <ControlButton
                                action={() => dispatch(setSessionState(SESSION_STATE.GAME_IN_PROGRESS))}
                                text={t('no', {ns: 'buttons'})}/>
                        </div>
                    </div>
                </div>
            </div>
        </ModalWindow>
    )
}
