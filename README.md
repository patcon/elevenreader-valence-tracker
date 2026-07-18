# 11ElevenReader Valence Tracker

_Warning: this is work-in-progress._

The purpose of this app is to add valence tracking to the 11ElevenReader web app, for the purposes of experiments in collective intelligence and group sensemaking.

## Features

- [x] Minimal detection of active word.
- [x] Desktop valence tracker
- [ ] Paired mobile valence tracking via QR + websockets
- [x] Import/Export of valence trace
- [x] Visualize own valence inline with text
- [ ] Save valence to database
- [ ] Visualize aggregate valence

## Usage

This extension is built with [WXT](https://wxt.dev).

1. Clone this repo.
2. Run `pnpm install`.
3. Run `pnpm build`.
4. Open `chrome://extensions/`, click "Load unpacked", and select the generated `.output/chrome-mv3` directory. Reload the extension here after each rebuild.
5. Visit any article in https://elevenreader.io/reader/library

Note: skip `pnpm dev` — its browser profile isn't logged into Google, which elevenreader.io requires.
