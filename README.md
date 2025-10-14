# SmartDocs Music — v3

## What changed
- Removed **Remove** buttons (no one can delete items from the UI).
- Added **Playlist Picker** buttons: **SmartDocsRadio** and **Gym**.
- Auto-loads **SmartDocsRadio.m3u**.
- More **Free Radios** presets.
- Added scripts to **auto-generate SmartDocsRadio.m3u** from `/audio`.

## Quick use
1) Put MP3s in `audio/`  
2) Generate playlist:
- **Windows:** `scripts\make-m3u.ps1 -Domain https://YOUR_DOMAIN`
- **Netlify Git deploy:** set `DOMAIN` env var and let the build run `node scripts/make-m3u.js`
3) Deploy → site auto-loads SmartDocsRadio.

## Alexa routine
Use: `play https://YOUR_DOMAIN/SmartDocsRadio.m3u`

See README for full details.
