console.log("=== ElevenReader Valence Tracker ===");

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------

const overlay = document.createElement("div");
overlay.id = "wordTrackerOverlay";

overlay.innerHTML = `
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

const wordLabel = document.getElementById("vtWord");
const desktopButton = document.getElementById("vtDesktop");
const axis = document.getElementById("vtAxis");
const marker = document.getElementById("vtMarker");

function focusPlayButton() {

    const playButton = document.querySelector('button[aria-label="Play"], button[aria-label="Pause"]');

    if (playButton)
        playButton.focus();
}

// -----------------------------------------------------------------------------
// Active word tracking
// -----------------------------------------------------------------------------

let currentWord = "";
let currentOffset = "";

function updateWord(el) {

    currentWord = el.textContent.trim();
    currentOffset = el.getAttribute("c") || "";

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

const initial = document.querySelector("span.active");

if (initial)
    updateWord(initial);

// -----------------------------------------------------------------------------
// Pointer Lock valence capture
// -----------------------------------------------------------------------------

let valence = 0;

const sensitivity = 0.004;

function clamp(v) {
    return Math.max(-1, Math.min(1, v));
}

function redrawMarker() {

    marker.style.top = ((1 - valence) / 2 * 100) + "%";
}

function onMove(e) {

    valence = clamp(
        valence - e.movementY * sensitivity
    );

    redrawMarker();

    console.log({
        word: currentWord,
        offset: currentOffset,
        valence: Number(valence.toFixed(3)),
        t: performance.now()
    });

}

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
