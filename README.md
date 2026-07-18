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
3. Build the extension:
   - `pnpm build` (one-off) → `.output/chrome-mv3`
   - `pnpm dev` (watch, rebuilds on save) → `.output/chrome-mv3-dev`
4. Open `chrome://extensions/`, click "Load unpacked", and select the directory from step 3. Reload the extension there after each rebuild.
5. Visit any article in https://elevenreader.io/reader/library

Note: `pnpm dev` won't auto-launch a browser (configured via `webExt.disabled` in `wxt.config.ts`). Google blocks logins from that kind of automated/unrecognized browser profile as a security measure, so it can never sign in to reach elevenreader.io's reader pages, which require Google login. It still rebuilds automatically to `.output/chrome-mv3-dev` on every save, so with it running you just reload the extension after each save instead of rebuilding it yourself.
