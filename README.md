# 11ElevenReader Valence Tracker

_Warning: this is work-in-progress._

The purpose of this app is to add valence tracking to the 11ElevenReader web app, for the purposes of experiments in collective intelligence and group sensemaking.

## Features

- [x] Minimal detection of active word.
- [ ] Desktop valence tracker
- [ ] Paired mobile valence tracking via QR + websockets
- [ ] Import/Export of valence trace
- [ ] Visualize own valence inline with text
- [ ] Save valence to database
- [ ] Visualize aggregate valence

## Usage

This extension is built with [WXT](https://wxt.dev).

1. Clone this repo.
2. Run `pnpm install`.
3. For development with hot reload: `pnpm dev` — this launches a browser with the extension loaded.
4. For a one-off build: `pnpm build`, then open `chrome://extensions/`, click "Load unpacked", and select the generated `.output/chrome-mv3` directory.
5. Visit any article in https://elevenreader.io/reader/library
