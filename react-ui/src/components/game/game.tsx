import './game.scss'
import React, {useEffect} from "react";
import {GameResult} from "../game-result/game-result";
import {GameCountdown} from "../game-countdown/game-countdown";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {GamePause} from "../game-pause/game-pause";
import {setSessionState} from "../../store/arkanoid-state";
import {EVENT_TYPE} from "../../utils/matchmaking/event-type";

export const Game = () => {

        const {sessionState} = useAppSelector(state => state.arkanoidState);

        const dispatch = useAppDispatch();

        const forfeitListener = () => dispatch(setSessionState(SESSION_STATE.GAME_PAUSED));

        useEffect(() => {
            if (sessionState === SESSION_STATE.GAME_IN_PROGRESS) {
                // @ts-ignore
                global.startGame && global.startGame();
                window.addEventListener(EVENT_TYPE.FORFEIT, forfeitListener);
            } else {
                window.removeEventListener(EVENT_TYPE.FORFEIT, forfeitListener);
            }
        }, [sessionState]);


        return (
            <div className='game'>
                <GameCountdown/>
                <GameResult/>
                <GamePause/>
            </div>
        );
    }
;

