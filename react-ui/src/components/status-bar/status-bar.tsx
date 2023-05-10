import styles from './status-bar.module.scss';
import {roomClient} from "../../store/room-client";
import {useAppSelector} from "../../store/hooks";
import {SESSION_STATE} from "../../utils/matchmaking/session-state";
import {useEffect} from "react";
import useCopy from "use-copy";

interface StatusBarProps {
    client: roomClient
}

export const StatusBar = ({client}: StatusBarProps) => {

    const {sessionState, matchmaking: {roomId}} = useAppSelector(state => state.arkanoidState);

    const [textCopied, copy, setTextCopied] = useCopy(`${window.location.origin}/?${roomId}`);

    useEffect(() => {
        textCopied && setTextCopied(false);
    }, [sessionState]);

    const {name, id, ready, connected} = client;

    const waitingConfirmation = sessionState === SESSION_STATE.AWAITING_CONFIRMATION && !ready;

    const iconClassName = `${styles['status-bar__icon']} ${
        connected
            ? waitingConfirmation ? styles['status-bar__icon-waiting']
            : ready ? styles['status-bar__icon-ready'] : ''
            : styles['status-bar__icon-copy']
    }`;

    return (
        <div className={styles['status-bar']}>
            <div
                className={styles['status-bar__title']}>{`${name || id || 'Invite Link'} ${textCopied ? '- Copied!' : ''}`}</div>
            <div className={iconClassName}
                 onClick={!connected ? () => copy() : () => void (0)}/>
        </div>
    )
}
