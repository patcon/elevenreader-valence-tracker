import { valenceToColor } from "./valence-color";

export interface StyleTarget {
    style: { backgroundColor: string };
}

export class WordValenceStore {

    private readonly values = new Map<string, number>();

    set(offset: string, valence: number): void {
        this.values.set(offset, valence);
    }

    get(offset: string): number | undefined {
        return this.values.get(offset);
    }

}

export function paintElement(el: StyleTarget, valence: number): void {
    el.style.backgroundColor = valenceToColor(valence);
}
