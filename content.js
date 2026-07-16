console.log("Word tracker loaded.");

const overlay = document.createElement("div");
overlay.id = "wordTrackerOverlay";
overlay.textContent = "...";
document.body.appendChild(overlay);

let previousWord = null;

function currentWord() {
    return document.querySelector("span.active");
}

function update() {

    const active = currentWord();

    if (!active)
        return;

    if (active === previousWord)
        return;

    previousWord = active;

    const word = active.textContent.trim();
    const offset = active.getAttribute("c");

    overlay.textContent = word;

    console.log({
        word,
        offset,
        time: Date.now()
    });
}

const observer = new MutationObserver(update);

observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"]
});

update();
