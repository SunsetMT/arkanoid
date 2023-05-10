import styles from './information-alert.module.scss';
import {ModalWindow} from "../modal-window/modal-window";
import {useTranslation} from "react-i18next";

interface DescriptionAlertProps {
    isOpen: boolean,
    alertKey: string,
    close: () => void
}

export const InformationAlert = ({isOpen, alertKey, close}: DescriptionAlertProps) => {

    const {t} = useTranslation(['settings', 'buttons']);

    return (
        <ModalWindow open={isOpen}>
            <div className={styles['information-alert']}>
                <span className={styles['information-alert__text']}>{t(alertKey)}</span>
                <button className={styles['information-alert__close-button']} onClick={close}>
                    {t('close', {ns: 'buttons'})}
                </button>
            </div>
        </ModalWindow>
    )
}
