import i18n from '../../utils/translation/i18next'
import styles from './lang-switcher.module.scss';
import {useState} from "react";

export const LangSwitcher = () => {

    const [selectedLanguage, setLanguage] = useState(i18n.language);

    const notSelectedLanguage = i18n.languages.filter(language => language !== selectedLanguage).toString();

    const switchLanguage = () => {
        i18n.changeLanguage(notSelectedLanguage).then(() => setLanguage(notSelectedLanguage));
    }

    return (
        <button
            className={styles['lang-switcher']}
            onClick={() => switchLanguage()}>
            {notSelectedLanguage.toUpperCase()}
        </button>
    )
}
