console.log("=== ElevenReader Valence Tracker loaded ===");

function makeOverlay() {

    const div = document.createElement("div");
    div.id = "wordTrackerOverlay";
    div.textContent = "Waiting...";

    document.body.appendChild(div);

    console.log("Overlay inserted.");

    return div;
}

const overlay = makeOverlay();

let previousElement = null;

const observer = new MutationObserver((mutations) => {

    for (const mutation of mutations) {

        if (mutation.type !== "attributes")
            continue;

        const el = mutation.target;

        if (!(el instanceof HTMLElement))
            continue;

        if (!el.classList.contains("active"))
            continue;

        if (el === previousElement)
            continue;

        previousElement = el;

        const word = el.textContent.trim();
        const offset = el.getAttribute("c");

        overlay.textContent = word;

        console.log("ACTIVE:", word, offset);
    }

});

observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
});

console.log("Mutation observer started.");
