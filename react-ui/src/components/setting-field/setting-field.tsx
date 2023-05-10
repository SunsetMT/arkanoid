import styles from './setting-field.module.scss';
import {Setting} from "../../utils/settings/default-settings";
import {Slider} from "@mui/material";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {useState} from "react";
import {InformationAlert} from "../information-alert/information-alert";

interface SettingFieldProps {
    setting: Setting,
    update: (key: string, value: number) => void
}

const theme = createTheme({
    palette: {
        primary: {
            main: '#F5F5F5',
        }
    }
});

export const SettingField = ({setting, update}: SettingFieldProps) => {

    const {name, key, type, value, minValue, maxValue, step} = setting;

    const [alertOpen, setAlertOpen] = useState<boolean>(false);

    const removeLeadingZeros = (value: string) => {
        const isFloatValue = /\./.test(value);
        const leadingZeros = /^0+/;
        return value.replace(leadingZeros, isFloatValue ? '0' : '');
    }

    const controlElement =
        type === 'input' ?
            <input
                type='number'
                min={minValue || 0}
                max={maxValue || 100}
                step={step || 1}
                value={value}
                inputMode={'decimal'}
                required={true}
                id={key}
                onChange={(e) => {
                    e.currentTarget.value = removeLeadingZeros(e.currentTarget.value);
                    update(key, +e.currentTarget.value)
                }}
            />
            : type === 'slider' ?
            <ThemeProvider theme={theme}>
                <Slider
                    value={value}
                    aria-label="Default"
                    valueLabelDisplay="auto"
                    min={minValue}
                    max={maxValue}
                    step={step}
                    id={key}
                    onChange={(e, value) => update(key, +value)}
                />
            </ThemeProvider>
            :
            <input type='checkbox' checked={!!value} id={key} onChange={(e) => update(key, +e.currentTarget.checked)}/>;


    return (
        <div className={styles['setting-field']}>
            <div className={styles['setting-field__name']}>
                {name}:
            </div>
            <div className={styles['setting-field__control']}>
                {controlElement}
            </div>
            <div className={styles['setting-field__description']}>
                <InformationAlert
                    isOpen={alertOpen}
                    alertKey={key}
                    close={() => setAlertOpen(false)}/>
                <div
                    className={styles['setting-field__description__help']}
                    onClick={() => setAlertOpen(true)}/>
            </div>
        </div>

    )
}
