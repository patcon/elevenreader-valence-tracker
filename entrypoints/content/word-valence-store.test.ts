import { describe, expect, it } from "vitest";
import { WordValenceStore, paintElement } from "./word-valence-store";

describe("WordValenceStore", () => {

    it("returns undefined for an offset that was never set", () => {
        const store = new WordValenceStore();
        expect(store.get("12")).toBeUndefined();
    });

    it("returns the last value set for an offset", () => {
        const store = new WordValenceStore();
        store.set("12", 0.2);
        store.set("12", -0.7);
        expect(store.get("12")).toBe(-0.7);
    });

    it("keeps separate values per offset", () => {
        const store = new WordValenceStore();
        store.set("12", 0.5);
        store.set("40", -0.5);
        expect(store.get("12")).toBe(0.5);
        expect(store.get("40")).toBe(-0.5);
    });

});

describe("paintElement", () => {

    it("sets the element's background color from its valence", () => {
        const el = { style: { backgroundColor: "" } };
        paintElement(el, 1);
        expect(el.style.backgroundColor).toBe("rgba(74, 192, 120, 0.45)");
    });

});
