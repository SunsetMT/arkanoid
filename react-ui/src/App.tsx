import React, {useEffect} from 'react';
import styles from './App.module.scss';
import {Routes, Route} from 'react-router-dom'
import {Game} from "./components/game/game";
import {MainMenu} from "./components/main-menu/main-menu";
import {Settings} from "./components/settings/settings";
import {FullScreen, useFullScreenHandle} from "react-full-screen";
import {InterfaceScreen} from "./components/interface-screen/interface-screen";
import {AuthPage} from "./components/auth-page/auth-page";
import {getSettings} from "./utils/settings/get-settings";
import {saveSettings} from "./utils/settings/save-settings";
import {defaultSettings} from "./utils/settings/default-settings";

function App() {

    const fullScreenHandle = useFullScreenHandle();

    useEffect(() => {
        if (!document.getElementById('babylonScript')) {
            localStorage.setItem('gameMode', 'multiplayer');
            localStorage.setItem('isInitReady', 'false');
            const script = document.createElement("script");
            script.id = 'babylonScript';
            script.type = 'text/javascript';
            script.src = "js/bundleName.js";
            script.defer = true;
            document.head.appendChild(script);
        }
        // if no game settings found in localStorage default ones will be used
        !getSettings().length && saveSettings(defaultSettings);
    }, []);

    return (
        <FullScreen handle={fullScreenHandle}>
            <div className={styles['game-wrapper']}>
                <Routes>
                    <Route path="/" element={<InterfaceScreen fullScreenHandle={fullScreenHandle}/>}>
                        <Route index element={<AuthPage/>}/>
                        <Route path="/menu" element={<MainMenu/>}/>
                        <Route path="/game" element={<Game/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                    </Route>
                </Routes>

            </div>
        </FullScreen>
    );
}

export default App;
