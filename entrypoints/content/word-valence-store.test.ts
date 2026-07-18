// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { WordValenceStore, isJump, paintElement } from "./word-valence-store";

function buildDom(offsets: string[]): HTMLElement {
    const root = document.createElement("div");
    for (const offset of offsets) {
        const span = document.createElement("span");
        span.setAttribute("c", offset);
        root.appendChild(span);
    }
    return root;
}

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

describe("isJump", () => {

    it("is never a jump for the first word of a session", () => {
        expect(isJump("", "", "0")).toBe(false);
    });

    it("is not a jump for an ordinary word-to-word transition", () => {
        // "asked" at c=11 (len 5) -> "you" at c=17, a 1-char gap for the space
        expect(isJump("11", "asked", "17")).toBe(false);
    });

    it("is not a jump for an ordinary paragraph-break-sized gap", () => {
        // "centuries." at c=638 (len 10) -> "The" at c=670, a 22-char gap
        expect(isJump("638", "centuries.", "670")).toBe(false);
    });

    it("is a jump for a large forward gap", () => {
        expect(isJump("638", "centuries.", "5000")).toBe(true);
    });

    it("is always a jump for a rewind", () => {
        expect(isJump("670", "The", "638")).toBe(true);
    });

});

describe("WordValenceStore.advance", () => {

    it("marks a newly entered offset as heard with no movement (null)", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        expect(store.get("0")).toBeNull();
    });

    it("does not clobber an existing explicit value when revisited", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        store.set("0", 0.5);
        store.advance("17", "you");
        store.advance("0", "If");
        expect(store.get("0")).toBe(0.5);
    });

    it("is a no-op when re-advancing to the same offset", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        store.set("0", 0.8);
        store.advance("0", "If");
        expect(store.get("0")).toBe(0.8);
    });

    it("carries the last explicit value forward onto a subsequent null word", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        store.set("0", 0.6);
        store.advance("3", "someone");
        const root = buildDom(["0", "3"]);
        store.paintOffset(root, "3", true);
        const span = root.querySelector('span[c="3"]') as HTMLElement;
        expect(span.style.backgroundColor).not.toBe("");
    });

    it("resets the carry across a detected jump so it does not leak into unheard territory", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        store.set("0", 0.6);
        store.advance("5000", "Later"); // large forward gap -> jump
        const root = buildDom(["5000"]);
        store.paintOffset(root, "5000", true);
        const span = root.querySelector('span[c="5000"]') as HTMLElement;
        expect(span.style.backgroundColor).toBe("");
    });

});

describe("WordValenceStore.paintOffset", () => {

    it("paints an explicit value regardless of fillGaps", () => {
        const store = new WordValenceStore();
        store.set("12", 1);
        const root = buildDom(["12"]);

        store.paintOffset(root, "12", false);

        const span = root.querySelector('span[c="12"]') as HTMLElement;
        expect(span.style.backgroundColor).toBe("rgba(74, 192, 120, 0.45)");
    });

    it("clears a null offset when fillGaps is false", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        const root = buildDom(["0"]);
        const span = root.querySelector('span[c="0"]') as HTMLElement;
        span.style.backgroundColor = "rgba(74, 192, 120, 0.45)";

        store.paintOffset(root, "0", false);

        expect(span.style.backgroundColor).toBe("");
    });

    it("never touches an offset that was never heard", () => {
        const store = new WordValenceStore();
        const root = buildDom(["12"]);
        const span = root.querySelector('span[c="12"]') as HTMLElement;
        span.style.backgroundColor = "rgba(74, 192, 120, 0.45)";

        store.paintOffset(root, "12", true);

        expect(span.style.backgroundColor).toBe("rgba(74, 192, 120, 0.45)");
    });

});

describe("WordValenceStore.renderAll", () => {

    it("paints known offsets and clears unknown ones, respecting fillGaps", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        store.set("0", 0.6);
        store.advance("3", "someone"); // null, carries 0.6
        const root = buildDom(["0", "3", "99"]);
        const stale = root.querySelector('span[c="99"]') as HTMLElement;
        stale.style.backgroundColor = "rgba(74, 192, 120, 0.45)";

        store.renderAll(root, true);

        const first = root.querySelector('span[c="0"]') as HTMLElement;
        const second = root.querySelector('span[c="3"]') as HTMLElement;
        expect(first.style.backgroundColor).not.toBe("");
        expect(second.style.backgroundColor).not.toBe("");
        expect(stale.style.backgroundColor).toBe("");
    });

    it("clears null offsets when fillGaps is false", () => {
        const store = new WordValenceStore();
        store.advance("0", "If");
        store.set("0", 0.6);
        store.advance("3", "someone");
        const root = buildDom(["0", "3"]);

        store.renderAll(root, false);

        const second = root.querySelector('span[c="3"]') as HTMLElement;
        expect(second.style.backgroundColor).toBe("");
    });

});

describe("WordValenceStore.rebuildFromSamples", () => {

    it("keeps only the last value per offset, regardless of arrival order", () => {
        const store = new WordValenceStore();
        store.rebuildFromSamples([
            { word: "someone", offset: "12", valence: 0.2 },
            { word: "asked", offset: "40", valence: -0.9 },
            { word: "someone", offset: "12", valence: -0.7 },
        ]);
        expect(store.get("12")).toBe(-0.7);
        expect(store.get("40")).toBe(-0.9);
    });

    it("clears any previously held values before rebuilding", () => {
        const store = new WordValenceStore();
        store.set("99", 0.5);
        store.rebuildFromSamples([{ word: "x", offset: "12", valence: 0.2 }]);
        expect(store.get("99")).toBeUndefined();
    });

    it("replays null (heard, no movement) samples so carry-forward reconstructs identically to live playback", () => {
        const store = new WordValenceStore();
        store.rebuildFromSamples([
            { word: "If", offset: "0", valence: 0.6 },
            { word: "someone", offset: "3", valence: null },
        ]);
        expect(store.get("3")).toBeNull();

        const root = buildDom(["0", "3"]);
        store.renderAll(root, true);
        const second = root.querySelector('span[c="3"]') as HTMLElement;
        expect(second.style.backgroundColor).not.toBe("");
    });

    it("resets carry across a jump recorded in the sample log", () => {
        const store = new WordValenceStore();
        store.rebuildFromSamples([
            { word: "centuries.", offset: "638", valence: 0.6 },
            { word: "Later", offset: "5000", valence: null }, // large gap -> jump
        ]);

        const root = buildDom(["638", "5000"]);
        store.renderAll(root, true);
        const jumped = root.querySelector('span[c="5000"]') as HTMLElement;
        expect(jumped.style.backgroundColor).toBe("");
    });

});
