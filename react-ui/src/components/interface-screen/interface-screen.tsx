import styles from './interface-screen.module.scss';
import React, {useEffect, useRef, useState} from "react";
import {FullScreenHandle} from "react-full-screen";
import {useLocation, Outlet} from 'react-router-dom';
import {ControlsPanel} from "../controls-panel/controls-panel";
import {useTranslation} from "react-i18next";

interface GameScreenProps {
    fullScreenHandle: FullScreenHandle
}

export const InterfaceScreen = ({fullScreenHandle}: GameScreenProps) => {

    const {pathname} = useLocation();

    const {t} = useTranslation('headers');

    const interfaceScreenTitle = useRef('');

    const defaultGameClassName = styles['interface-screen__container__content__game'];
    const hiddenGameClassName = styles['interface-screen__container__content__game_hidden'];

    const defaultInterfaceClassName = styles['interface-screen'];
    const gameInterfaceClassName = styles['interface-screen-game'];

    const [gameClassName, setGameClassName] = useState(defaultGameClassName);
    const [interfaceClassName, setInterfaceClassName] = useState(defaultInterfaceClassName);

    useEffect(() => {
        if (!pathname.includes('game')) {
            setGameClassName(`${defaultGameClassName} ${hiddenGameClassName}`);
            setInterfaceClassName(defaultInterfaceClassName);
        } else {
            setGameClassName(defaultGameClassName);
            setInterfaceClassName(`${defaultInterfaceClassName} ${gameInterfaceClassName}`)
        }
    }, [pathname, defaultGameClassName, hiddenGameClassName]);


    switch (true) {
        case pathname.includes('menu'):
            interfaceScreenTitle.current = t('menu');
            break;
        case pathname.includes('settings'):
            interfaceScreenTitle.current = t('settings');
            break;
        case pathname.endsWith('/'):
            interfaceScreenTitle.current = 'Arkanoid';
            break;
        default:
            interfaceScreenTitle.current = '';
    }

    return (
        <div className={interfaceClassName}>
            <div className={styles['interface-screen__container']}>
                <div className={styles['interface-screen__container__content']}>
                    <div>
                        {interfaceScreenTitle.current &&
                        <div className={styles['interface-screen__container__content__header']}>
                            <div className={styles['interface-screen__container__content__header__title']}>
                                {interfaceScreenTitle.current}
                            </div>
                        </div>}
                        <ControlsPanel fullScreenHandle={fullScreenHandle}/>
                    </div>
                    <div className={gameClassName}>
                        <div id={'canvasField'}
                             className={styles['interface-screen__container__content__game__canvas-field']}/>
                    </div>
                    <Outlet/>
                </div>
            </div>
        </div>
    )
}
