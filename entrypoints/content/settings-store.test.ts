// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { loadSettings, saveSettings } from "./settings-store";

beforeEach(() => {
    localStorage.clear();
});

describe("loadSettings", () => {

    it("defaults to onlyChangingValence: true when nothing is stored", () => {
        expect(loadSettings()).toEqual({ onlyChangingValence: true });
    });

    it("returns a previously saved setting", () => {
        saveSettings({ onlyChangingValence: false });
        expect(loadSettings()).toEqual({ onlyChangingValence: false });
    });

    it("falls back to defaults when the stored value is corrupt JSON", () => {
        localStorage.setItem("vtSettings", "{not json");
        expect(loadSettings()).toEqual({ onlyChangingValence: true });
    });

});

describe("saveSettings", () => {

    it("persists across separate loadSettings calls", () => {
        saveSettings({ onlyChangingValence: false });
        expect(loadSettings().onlyChangingValence).toBe(false);
        saveSettings({ onlyChangingValence: true });
        expect(loadSettings().onlyChangingValence).toBe(true);
    });

});
