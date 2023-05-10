import styles from './settings.module.scss';
import React, {useEffect, useState} from "react";
import {ControlButton} from "../control-button/control-button";
import {SettingField} from "../setting-field/setting-field";
import {defaultSettings} from "../../utils/settings/default-settings";
import {getSettings} from "../../utils/settings/get-settings";
import {saveSettings} from "../../utils/settings/save-settings";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

export const Settings = () => {

    const [currentSettings, updateCurrentSettings] = useState(getSettings().length ? getSettings() : defaultSettings);

    const [settingsList, setSettingsList] = useState<JSX.Element[]>([]);

    const {t} = useTranslation('buttons')

    const navigate = useNavigate();

    useEffect(() => {
        const updateSettings = (key: string, value: number) => {
            const newSettings = [...currentSettings];
            const updatedSettingIndex = newSettings.findIndex(setting => setting.key === key);
            newSettings[updatedSettingIndex] = {...newSettings[updatedSettingIndex], value};
            updateCurrentSettings(newSettings);
        }

        const isAdvancedGenEnabled = !!currentSettings.find(s => s.key === 'advancedGen')!.value;
        const settings = currentSettings.reduce((sList: JSX.Element[], setting) => {
            const s = <SettingField setting={setting} update={updateSettings}/>
            if ('advanced' in setting) {
                (isAdvancedGenEnabled === setting.advanced) && sList.push(s);
            } else {
                sList.push(s);
            }
            return sList;
        }, []);
        setSettingsList(settings);
    }, [currentSettings]);

    const form = document.getElementById('settings-form') as HTMLFormElement;

    const resetSettings = () => updateCurrentSettings(defaultSettings);

    const saveSettingsAndQuit = () => {
        if (form.checkValidity()) {
            saveSettings(currentSettings);
            navigate('/menu');
        } else {
            form.reportValidity();
        }
    }

    return (
        <div className={styles['settings']}>
            <form id='settings-form'>
                {settingsList}
                <div className={styles['settings-controls']}>
                    <ControlButton action={resetSettings} text={t('resetSettings')}/>
                    <ControlButton action={saveSettingsAndQuit} text={t('saveSettings')}/>
                </div>
            </form>
        </div>
    )
}
