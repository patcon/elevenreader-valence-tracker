export interface Settings {
    onlyChangingValence: boolean;
}

const DEFAULT_SETTINGS: Settings = { onlyChangingValence: true };
const STORAGE_KEY = "vtSettings";

export function loadSettings(): Settings {

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
