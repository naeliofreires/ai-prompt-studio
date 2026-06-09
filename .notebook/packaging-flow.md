# Packaging Flow
> Electron Builder packaging for unsigned local installers

Entry: `package.json` (L18-21)

Build chain: `npm run dist:mac` -> `npm run build` -> Vite renderer in `dist/` + Electron main in `dist-electron/` -> `electron-builder --mac dmg`

Dev chain: `npm run dev` -> Vite renderer + Electron main watcher + Electron shell
- `dev:electron` runs `copy:personas` before waiting on Vite/main output.
- `scripts/copy-personas-spec.mjs` validates JSON and renames temp files atomically into `dist-electron/spec/`.
- Avoids Electron reading stale or partially-written `dist-electron/spec/*.json` while importing shared domain modules.

Config: `package.json` (L66-93)
- Output directory: `release/`
- Packaged files: `dist/**/*`, `dist-electron/**/*`
- macOS target: DMG
- Windows target: NSIS
- Linux target: AppImage

Packaged renderer load: `src/main/index.ts:createMainWindow()` (L32-37)
- Dev loads Vite at `http://localhost:5173`
- Packaged app loads `dist/index.html` relative to compiled main file
- Avoids `process.cwd()` because installed apps may launch from another directory

Gotchas:
- First `npm run dist:mac` may download Electron runtime from GitHub
- `dist-electron/` can exist before dev starts; Electron must not treat file existence alone as proof specs are current.
- Packaged Electron loads the renderer with `loadFile`; Vite's default `base: "/"` emits `/assets/...`, which resolves outside the app under `file://` and can leave the installed app showing only the dark window background. `vite.config.ts` sets `base: "./"` so renderer assets stay relative to `dist/index.html`.
- macOS output is ad-hoc signed unless real signing/notarization config exists
- App icon assets live in `public/icon.svg` and `public/icon.png`; Electron Builder converts `public/icon.png` through `package.json` build icon config.

Updated: 2026-06-09
