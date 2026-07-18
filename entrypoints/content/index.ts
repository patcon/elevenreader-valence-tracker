import "./style.css";
import { WordValenceStore, paintElement } from "./word-valence-store";

interface Sample {
  word: string;
  offset: string;
  valence: number;
  t: number;
}

interface ExportedData {
  url: string;
  exportedAt: string;
  samples: Sample[];
}

export default defineContentScript({
  matches: ["https://elevenreader.io/reader/library/*"],
  runAt: "document_idle",
  cssInjectionMode: "manifest",

  main() {
    console.log("=== ElevenReader Valence Tracker ===");

    // -----------------------------------------------------------------------------
    // UI
    // -----------------------------------------------------------------------------

    const overlay = document.createElement("div");
    overlay.id = "wordTrackerOverlay";

    overlay.innerHTML = `
        <div id="vtFinePrint">
            <button id="vtExport" class="vtIconButton" aria-label="Export tracking data" title="Export tracking data">⬇</button>
            <button id="vtImport" class="vtIconButton" aria-label="Import tracking data" title="Import tracking data">⬆</button>
            <input id="vtImportFile" type="file" accept="application/json" hidden>
        </div>

        <div id="vtWord">Waiting...</div>

        <div id="vtButtons">
            <button id="vtDesktop" class="vtButton">
                🖱 Desktop
            </button>

            <button id="vtMobile" class="vtButton" disabled>
                📱 Mobile
            </button>
        </div>

        <div id="vtAxis">
            <div id="vtPlus">+1</div>
            <div id="vtZero"></div>
            <div id="vtMinus">−1</div>
            <div id="vtMarker"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const wordLabel = document.getElementById("vtWord") as HTMLElement;
    const desktopButton = document.getElementById("vtDesktop") as HTMLButtonElement;
    const axis = document.getElementById("vtAxis") as HTMLElement;
    const marker = document.getElementById("vtMarker") as HTMLElement;
    const exportButton = document.getElementById("vtExport") as HTMLButtonElement;
    const importButton = document.getElementById("vtImport") as HTMLButtonElement;
    const importFile = document.getElementById("vtImportFile") as HTMLInputElement;

    function focusPlayButton() {

        const playButton = document.querySelector('button[aria-label="Play"], button[aria-label="Pause"]') as HTMLElement | null;

        if (playButton)
            playButton.focus();
    }

    // -----------------------------------------------------------------------------
    // Active word tracking
    // -----------------------------------------------------------------------------

    let currentWord = "";
    let currentOffset = "";
    let currentSpan: HTMLElement | null = null;

    let samples: Sample[] = [];

    const wordValence = new WordValenceStore();

    const PENDING_IMPORT_KEY = "vtPendingImport";

    const pendingImport = sessionStorage.getItem(PENDING_IMPORT_KEY);

    if (pendingImport) {

        sessionStorage.removeItem(PENDING_IMPORT_KEY);

        const data: ExportedData = JSON.parse(pendingImport);

        samples = data.samples || [];

        console.log(`Imported ${samples.length} sample(s) recorded at ${data.url}`);
    }

    function updateWord(el: HTMLElement) {

        currentWord = el.textContent?.trim() || "";
        currentOffset = el.getAttribute("c") || "";
        currentSpan = el;

        wordLabel.textContent = currentWord;

        console.log("WORD:", currentWord, currentOffset);
    }

    const observer = new MutationObserver((mutations) => {

        for (const m of mutations) {

            if (m.type !== "attributes")
                continue;

            const el = m.target;

            if (!(el instanceof HTMLElement))
                continue;

            if (!el.classList.contains("active"))
                continue;

            updateWord(el);
        }

    });

    observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
    });

    // Catch an already-active word when we load.

    const initial = document.querySelector("span.active") as HTMLElement | null;

    if (initial)
        updateWord(initial);

    // -----------------------------------------------------------------------------
    // Pointer Lock valence capture
    // -----------------------------------------------------------------------------

    let valence = 0;

    const sensitivity = 0.004;

    function clamp(v: number) {
        return Math.max(-1, Math.min(1, v));
    }

    function redrawMarker() {

        marker.style.top = ((1 - valence) / 2 * 100) + "%";
    }

    function onMove(e: MouseEvent) {

        valence = clamp(
            valence - e.movementY * sensitivity
        );

        redrawMarker();

        const sample: Sample = {
            word: currentWord,
            offset: currentOffset,
            valence: Number(valence.toFixed(3)),
            t: performance.now()
        };

        samples.push(sample);

        wordValence.set(currentOffset, valence);

        if (currentSpan)
            paintElement(currentSpan, valence);

        console.log(sample);

    }

    // -----------------------------------------------------------------------------
    // Import / export
    // -----------------------------------------------------------------------------

    exportButton.addEventListener("click", () => {

        if (samples.length === 0) {

            alert("Nothing to export yet — no valence data has been recorded.");

            return;
        }

        const data: ExportedData = {
            url: location.href,
            exportedAt: new Date().toISOString(),
            samples
        };

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "valence-tracking.json";
        a.click();

        URL.revokeObjectURL(url);

    });

    importButton.addEventListener("click", () => {

        importFile.click();

    });

    importFile.addEventListener("change", async () => {

        const file = importFile.files?.[0];

        if (!file)
            return;

        const data: ExportedData = JSON.parse(await file.text());

        importFile.value = "";

        if (data.url && data.url !== location.href) {

            sessionStorage.setItem(PENDING_IMPORT_KEY, JSON.stringify(data));

            location.href = data.url;

            return;
        }

        samples = data.samples || [];

        console.log(`Imported ${samples.length} sample(s) recorded at ${data.url}`);

    });

    // -----------------------------------------------------------------------------
    // Capture lifecycle
    // -----------------------------------------------------------------------------

    desktopButton.addEventListener("click", () => {

        overlay.requestPointerLock();

    });

    document.addEventListener("pointerlockchange", () => {

        const active = document.pointerLockElement === overlay;

        if (active) {

            axis.classList.add("visible");

            desktopButton.textContent = "🖱 Capturing";
            desktopButton.classList.add("active");

            document.addEventListener("mousemove", onMove);

            focusPlayButton();

        } else {

            axis.classList.remove("visible");

            desktopButton.textContent = "🖱 Desktop";
            desktopButton.classList.remove("active");

            document.removeEventListener("mousemove", onMove);

            focusPlayButton();

        }

    });

    // -----------------------------------------------------------------------------
    // Initial UI
    // -----------------------------------------------------------------------------

    redrawMarker();

    console.log("Tracker ready.");
  },
});
