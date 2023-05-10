import {defaultSettings} from "./default-settings";
import {settingsKeys} from "./settings-keys";

export const getSettings = () => {
    // checks if all settings are saved in localStorage
    return settingsKeys().filter(key => Object.keys(localStorage).includes(key)).length === settingsKeys().length
        ?
        // gets values from localStorage
        defaultSettings.map((setting) => {
            const value = +localStorage.getItem(setting.key)!;
            return {...setting, value}
        })
        :
        // returns an empty array if at least one setting is absent in localStorage
        [];
}

