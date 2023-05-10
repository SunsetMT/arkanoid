import styles from './main-menu.module.scss';
import {ControlButton} from "../control-button/control-button";
import {useNavigate} from "react-router-dom";
import {useAppDispatch} from "../../store/hooks";
import {setMatchmakingIsActive, setSessionState} from "../../store/arkanoid-state";
import {Matchmaking} from "../matchmaking/matchmaking";
import {generateCubesMap} from "../../utils/matchmaking/generate-cubes-map";
import {useState} from "react";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {getGameResult} from "../../utils/game-result/get-game-result";

export const MainMenu = () => {

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const [PVEButtonText, setPVEButtonText] = useState('PVE');

    const [PVEButtonDisabled, setPVEButtonDisabled] = useState(false);

    const startPVP = () => {
        // additional matchmaking logic here
        dispatch(setMatchmakingIsActive(true));
    }

    const startPVE = () => {
        // @ts-ignore
        global.gameOverHandler = () => {
            localStorage.setItem('gameMode', 'multiplayer');
            dispatch(setSessionState(SESSION_STATE.GAME_OVER));
            getGameResult();
        }
        localStorage.setItem('gameMode', 'singleplayer');
        generateCubesMap();
        const startGame = () => {
            dispatch(setSessionState(SESSION_STATE.GAME_IN_PROGRESS));
            navigate('/game');
            setPVEButtonDisabled(false);
            setPVEButtonText('PVE');
            window.removeEventListener('gameIsReady', startGame);
        }
        if (localStorage.getItem('isGameReady') === 'true') {
            startGame();
        } else {
            setPVEButtonDisabled(true);
            setPVEButtonText('Loading');
            window.addEventListener('gameIsReady', startGame);
        }
    }

    return (
        <div className={styles['main-menu']}>
            <ControlButton action={startPVP} text={'PVP'} disabled={PVEButtonDisabled}/>
            <ControlButton action={startPVE} text={PVEButtonText} disabled={PVEButtonDisabled}/>
            <Matchmaking/>
        </div>
    )
}
