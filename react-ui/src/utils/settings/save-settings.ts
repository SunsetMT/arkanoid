import {Setting} from "./default-settings";

export const saveSettings = (settings: Setting[]) => {
    settings.forEach(setting => localStorage.setItem(setting.key, setting.value.toString()));
}
