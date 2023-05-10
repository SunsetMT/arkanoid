import styles from './game-countdown.module.scss';
import {ModalWindow} from "../modal-window/modal-window";
import {useAppSelector} from "../../store/hooks";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";

export const GameCountdown = () => {

    const {sessionState, matchmaking: {gameTimer}} = useAppSelector(state => state.arkanoidState);

    return (
        <ModalWindow open={sessionState === SESSION_STATE.READY} opaque={true}>
            <div className={styles['game-countdown']}>
                {gameTimer}
            </div>
        </ModalWindow>
    )
}
