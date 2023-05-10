import styles from './modal-window.module.scss';
import React from "react";

interface ModalWindowProps {
    open: boolean,
    opaque?: boolean,
    children: React.ReactNode
}

export const ModalWindow = ({open, opaque, children}: ModalWindowProps) => {

    const backDropClassName = !opaque
        ?
        `${styles['modal-window__backdrop']}`
        : `${styles['modal-window__backdrop']} ${styles['modal-window__backdrop-opaque']}`;

    return (
        open
            ?
            <div className={backDropClassName}>
                <div className={styles['modal-window__content']}>
                    {children}
                </div>
            </div>
            :
            <></>
    )
}
