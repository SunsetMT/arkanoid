import styles from './controls-panel.module.scss';
import {FullScreenHandle} from "react-full-screen";
import {FullscreenButton} from "../fullscreen-button/fullscreen-button";
import {LangSwitcher} from "../lang-switcher/lang-switcher";
import {useLocation, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {logOut, setRoomId, setSessionState} from "../../store/arkanoid-state";
import {useEffect} from "react";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";

interface ControlsPanelProps {
    fullScreenHandle: FullScreenHandle
}

export const ControlsPanel = ({fullScreenHandle}: ControlsPanelProps) => {

    const {isLoggedIn, isLoggedInAsGuest, sessionState} = useAppSelector(state => state.arkanoidState);

    const userSessionIsActive = isLoggedIn || isLoggedInAsGuest;

    const navigate = useNavigate();

    const {pathname, search} = useLocation();

    const dispatch = useAppDispatch();

    useEffect(() => {
        sessionState !== SESSION_STATE.STANDBY && dispatch(setSessionState(SESSION_STATE.STANDBY));
    }, []);

    useEffect(() => {
        !userSessionIsActive && navigate('/');
        // checking for the game room Id
        const roomId = search.match(/[^?]{9}/);
        roomId && dispatch(setRoomId(roomId[0]));
    }, [userSessionIsActive, navigate, dispatch, search]);

    const submitLogOut = () => {
        dispatch(logOut());
        navigate('/');
    }

    const isMainMenu = pathname.includes('menu');

    return (
        !pathname.includes('game')
            ?
            <div className={styles['controls-panel']}>
                {isMainMenu && <span className={styles['controls-panel__version']}>Version {process.env.REACT_APP_VERSION}</span>}
                <LangSwitcher/>
                <FullscreenButton fullScreenHandle={fullScreenHandle}/>
                {isMainMenu && <button
                    className={styles['controls-panel__settings-button']}
                    onClick={() => navigate('/settings')}/>}
                {isMainMenu && <button
                    className={styles['controls-panel__logout-button']}
                    onClick={() => submitLogOut()}
                />}
            </div>
            :
            <></>
    )
}
