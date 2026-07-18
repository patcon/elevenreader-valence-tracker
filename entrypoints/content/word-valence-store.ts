import { valenceToColor } from "./valence-color";

export interface StyleTarget {
    style: { backgroundColor: string };
}

export interface ValenceSample {
    word: string;
    offset: string;
    valence: number | null;
}

export function isJump(prevOffset: string, prevWord: string, newOffset: string): boolean {

    if (!prevOffset)
        return false;

    const prevNum = Number(prevOffset);
    const newNum = Number(newOffset);
    const expected = prevNum + prevWord.length;
    const tolerance = Math.max(20, prevWord.length * 3);

    return newNum < prevNum || (newNum - expected) > tolerance;
}

export class WordValenceStore {

    private readonly values = new Map<string, number | null>();
    private readonly carryValue = new Map<string, number | undefined>();

    private runningCarry: number | undefined = undefined;
    private lastOffset = "";
    private lastWord = "";

    set(offset: string, valence: number): void {
        this.values.set(offset, valence);
    }

    get(offset: string): number | null | undefined {
        return this.values.get(offset);
    }

    advance(offset: string, word: string): void {

        if (offset === this.lastOffset)
            return;

        const jump = isJump(this.lastOffset, this.lastWord, offset);

        const outgoingValue = this.lastOffset ? this.values.get(this.lastOffset) : undefined;

        if (typeof outgoingValue === "number")
            this.runningCarry = outgoingValue;

        if (jump)
            this.runningCarry = undefined;

        if (!this.values.has(offset)) {
            this.values.set(offset, null);
            this.carryValue.set(offset, this.runningCarry);
        }

        this.lastOffset = offset;
        this.lastWord = word;
    }

    rebuildFromSamples(samples: ValenceSample[]): void {

        this.values.clear();
        this.carryValue.clear();
        this.runningCarry = undefined;
        this.lastOffset = "";
        this.lastWord = "";

        for (const sample of samples) {

            this.advance(sample.offset, sample.word);

            if (sample.valence !== null)
                this.values.set(sample.offset, sample.valence);
        }
    }

    private resolveDisplayValue(offset: string, fillGaps: boolean): number | undefined {

        const value = this.values.get(offset);

        if (value === undefined || value === null)
            return value === null && fillGaps ? this.carryValue.get(offset) : undefined;

        return value;
    }

    private paintElementForOffset(el: HTMLElement, offset: string, fillGaps: boolean): void {

        const display = this.resolveDisplayValue(offset, fillGaps);

        if (display === undefined)
            el.style.backgroundColor = "";
        else
            paintElement(el, display);
    }

    paintOffset(root: ParentNode, offset: string, fillGaps: boolean): void {

        if (!this.values.has(offset))
            return;

        const el = root.querySelector(`span[c="${offset}"]`) as HTMLElement | null;

        if (el)
            this.paintElementForOffset(el, offset, fillGaps);
    }

    renderAll(root: ParentNode, fillGaps: boolean): void {

        root.querySelectorAll("span[c]").forEach((el) => {

            const offset = el.getAttribute("c");

            if (offset === null)
                return;

            if (!this.values.has(offset)) {
                (el as HTMLElement).style.backgroundColor = "";
                return;
            }

            this.paintElementForOffset(el as HTMLElement, offset, fillGaps);
        });
    }

}

export function paintElement(el: StyleTarget, valence: number): void {
    el.style.backgroundColor = valenceToColor(valence);
}
