import { valenceToColor } from "./valence-color";

export interface StyleTarget {
    style: { backgroundColor: string };
}

export interface ValenceSample {
    offset: string;
    valence: number;
}

export class WordValenceStore {

    private readonly values = new Map<string, number>();

    set(offset: string, valence: number): void {
        this.values.set(offset, valence);
    }

    get(offset: string): number | undefined {
        return this.values.get(offset);
    }

    rebuildFromSamples(samples: ValenceSample[]): void {

        this.values.clear();

        for (const sample of samples)
            this.values.set(sample.offset, sample.valence);
    }

    applyAll(root: ParentNode): void {

        root.querySelectorAll("span[c]").forEach((el) => {

            const offset = el.getAttribute("c");

            if (offset === null)
                return;

            const valence = this.get(offset);

            if (valence === undefined)
                (el as HTMLElement).style.backgroundColor = "";
            else
                paintElement(el as HTMLElement, valence);
        });
    }

}

export function paintElement(el: StyleTarget, valence: number): void {
    el.style.backgroundColor = valenceToColor(valence);
}
