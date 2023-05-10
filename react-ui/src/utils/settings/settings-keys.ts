import {defaultSettings} from "./default-settings";

export const settingsKeys = () => {
    return defaultSettings.reduce((keys: string[], setting) => {
        return [...keys, setting.key];
    }, [])
}
