import styles from './control-button.module.scss';
import {useNavigate} from "react-router-dom";
import React from "react";

interface ControlButtonProps {
    action: string | (() => void)
    text: string | (() => void),
    disabled?: boolean
}

export const ControlButton = ({text, action, disabled = false}: ControlButtonProps) => {

    const navigate = useNavigate();

    const onClickAction = () => typeof action === 'string' ? navigate(action) : action();

    return (
        <button
            className={`${styles['control-button']} ${disabled ? styles['control-button-disabled'] : ''}`}
            onClick={onClickAction}
            type='button'
            disabled={disabled}>
            {text}
        </button>
    )
}
