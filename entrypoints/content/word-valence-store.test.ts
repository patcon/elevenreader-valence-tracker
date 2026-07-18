// @vitest-environment happy-dom
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

describe("WordValenceStore.rebuildFromSamples", () => {

    it("keeps only the last value per offset, regardless of arrival order", () => {
        const store = new WordValenceStore();
        store.rebuildFromSamples([
            { offset: "12", valence: 0.2 },
            { offset: "40", valence: -0.9 },
            { offset: "12", valence: -0.7 },
        ]);
        expect(store.get("12")).toBe(-0.7);
        expect(store.get("40")).toBe(-0.9);
    });

    it("clears any previously held values before rebuilding", () => {
        const store = new WordValenceStore();
        store.set("99", 0.5);
        store.rebuildFromSamples([{ offset: "12", valence: 0.2 }]);
        expect(store.get("99")).toBeUndefined();
    });

});

describe("WordValenceStore.applyAll", () => {

    function buildDom(offsets: string[]): HTMLElement {
        const root = document.createElement("div");
        for (const offset of offsets) {
            const span = document.createElement("span");
            span.setAttribute("c", offset);
            root.appendChild(span);
        }
        return root;
    }

    it("paints spans whose offset has a known valence", () => {
        const store = new WordValenceStore();
        store.set("12", 1);
        const root = buildDom(["12"]);

        store.applyAll(root);

        const span = root.querySelector('span[c="12"]') as HTMLElement;
        expect(span.style.backgroundColor).toBe("rgba(74, 192, 120, 0.45)");
    });

    it("clears spans whose offset has no recorded valence", () => {
        const store = new WordValenceStore();
        const root = buildDom(["12"]);
        const span = root.querySelector('span[c="12"]') as HTMLElement;
        span.style.backgroundColor = "rgba(74, 192, 120, 0.45)";

        store.applyAll(root);

        expect(span.style.backgroundColor).toBe("");
    });

});
