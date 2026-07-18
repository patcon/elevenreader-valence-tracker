import { describe, expect, it } from "vitest";
import { valenceToColor } from "./valence-color";

describe("valenceToColor", () => {

    it("returns green at +1", () => {
        expect(valenceToColor(1)).toBe("rgba(74, 192, 120, 0.45)");
    });

    it("returns gray at 0", () => {
        expect(valenceToColor(0)).toBe("rgba(118, 122, 150, 0.45)");
    });

    it("returns red at -1", () => {
        expect(valenceToColor(-1)).toBe("rgba(227, 86, 86, 0.45)");
    });

    it("interpolates halfway between gray and green", () => {
        expect(valenceToColor(0.5)).toBe("rgba(96, 157, 135, 0.45)");
    });

    it("interpolates halfway between red and gray", () => {
        expect(valenceToColor(-0.5)).toBe("rgba(173, 104, 118, 0.45)");
    });

    it("clamps values above +1", () => {
        expect(valenceToColor(5)).toBe(valenceToColor(1));
    });

    it("clamps values below -1", () => {
        expect(valenceToColor(-5)).toBe(valenceToColor(-1));
    });

});
