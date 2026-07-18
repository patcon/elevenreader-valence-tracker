const GREEN: [number, number, number] = [74, 192, 120];
const GRAY: [number, number, number] = [118, 122, 150];
const RED: [number, number, number] = [227, 86, 86];

const ALPHA = 0.45;

function clamp(v: number): number {
    return Math.max(-1, Math.min(1, v));
}

function lerp(from: [number, number, number], to: [number, number, number], t: number): [number, number, number] {
    return [
        Math.round(from[0] + (to[0] - from[0]) * t),
        Math.round(from[1] + (to[1] - from[1]) * t),
        Math.round(from[2] + (to[2] - from[2]) * t),
    ];
}

export function valenceToColor(v: number): string {

    const clamped = clamp(v);

    const [r, g, b] = clamped >= 0
        ? lerp(GRAY, GREEN, clamped)
        : lerp(GRAY, RED, -clamped);

    return `rgba(${r}, ${g}, ${b}, ${ALPHA})`;
}
