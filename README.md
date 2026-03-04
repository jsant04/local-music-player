# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    ## Vibe Player – Local Music PWA

    Vibe Player is a Spotify-style, offline-ready web app for managing and playing your local music files. All audio, metadata, artwork, playlists, and settings live entirely in your browser using IndexedDB.

    Built with React, TypeScript, Vite, Tailwind CSS, Dexie, and the Media Session API.

    > Note: This project stores data only in your browser. No files are uploaded to any server.

    ---

    ## Features

    - Local MP3 import with ID3 parsing (via `music-metadata-browser`).
    - Artwork extraction with gradient/initials placeholders when missing.
    - IndexedDB storage for tracks, blobs (audio + artwork), playlists, and app settings.
    - Offline browsing and playback of previously imported songs.
    - Queue-based player with shuffle/repeat, seek bar, and Media Session integration.
    - Playlists CRUD, playlist detail view, and search.
    - Library view with search and sorting, multi-select + queue actions.
    - PWA installability (manifest + service worker) and offline fallback page.
    - Simple toast notifications and keyboard-focus-friendly UI.

    ### Screenshots (placeholders)

    - Upload page: docs/screenshots/upload.png
    - Songs page: docs/screenshots/songs.png
    - Now Playing: docs/screenshots/now-playing.png

    Replace these with actual screenshots after running the app.

    ---

    ## Data Model

    The app uses a Dexie-powered IndexedDB database (`VibeMusicDB`) with four tables.

    ```mermaid
    erDiagram
      TRACKS {
        string id PK
        string title
        string artist
        string album
        number duration
        number year
        string genre
        string artworkBlobId
        string audioBlobId
        string hash
        string createdAt
        string updatedAt
      }

      BLOBS {
        string id PK
        string type
        Blob   blob
      }

      PLAYLISTS {
        string id PK
        string name
        string[] trackIds
        string createdAt
        string updatedAt
      }

      APP {
        string id PK
        string theme
        string repeatMode
        boolean shuffle
        string[] lastQueue
        string lastTrackId
        number lastPosition
      }

      TRACKS ||--o{ BLOBS : "artworkBlobId -> id"
      TRACKS ||--o{ BLOBS : "audioBlobId -> id"
      PLAYLISTS }o--o{ TRACKS : "trackIds contains"
    ```

    ---

    ## Getting Started

    ### Prerequisites

    - Node.js 18+ (LTS recommended)
    - npm (bundled with Node)

    ### Install dependencies

    ```bash
    npm install
    ```

    ### Run the dev server

    ```bash
    npm run dev
    ```

    Then open the printed localhost URL in your browser.

    ### Build for production

    ```bash
    npm run build
    ```

    Preview the production build locally:

    ```bash
    npm run preview
    ```

    ---

    ## Vercel Deployment

    This app is fully static and deployable to Vercel without a backend.

    Key files:

    - vercel.json – SPA rewrite config (/* → /index.html).
    - vite.config.ts – Vite React + TS config.

    ### Deploy steps

    1. Commit this project to a Git repo (GitHub/GitLab/etc.).
    2. In Vercel, choose “Import Project” and select the repo.
    3. When prompted:
       - Framework preset: Vite (or “Other” with `npm run build`).
       - Build command: `npm run build`.
       - Output directory: `dist`.
    4. Deploy.

    Vercel will respect vercel.json so all routes rewrite to index.html.

    ---

    ## PWA & Offline Behavior

    - public/manifest.webmanifest defines install metadata and icons.
    - public/sw.js is a custom service worker that:
      - Precaches the app shell and offline.html.
      - Serves cached index.html for navigations when offline.
      - Caches image requests (artwork/icons) with a cache-first strategy.
    - IndexedDB holds all tracks, blobs, playlists, and settings, so previously imported audio is
      playable offline.

    ### Install the PWA

    1. Open the app in Chrome/Edge.
    2. Use the “Install Vibe Player” / “Install app” option in the address bar or main menu.
    3. The PWA runs in a standalone window with the bottom player bar and navigation.

    ### Testing offline support

    1. Run `npm run dev` or open a deployed build.
    2. Import a couple of tracks on /upload.
    3. Verify they appear in /songs and can be played.
    4. In DevTools → Application → Service Workers, check that sw.js is installed.
    5. Switch Chrome to Offline (Network tab → dropdown).
    6. Reload: the app shell should load from cache, and imported songs should still play.

    ---

    ## Backup, Export & Import

    Metadata backup (no audio blobs) lives in JSON export/import.

    - Export:
      - Go to Playlists.
      - Click Export library to download vibe-player-library.json.
      - This includes tracks, playlists, and app settings, but not audio blobs.
    - Import:
      - Click Import library and choose a previously exported JSON.
      - Tracks/playlists/settings are merged into IndexedDB.

    If you import an export on the same browser where the original blobs still exist, track references
    (audioBlobId, artworkBlobId) will automatically re-link to those blobs when present.

    Exporting audio blobs as a ZIP is not implemented to keep the app lightweight and fully client-only.

    ---

    ## Accessibility Notes

    - All primary controls are keyboard operable (focus rings, tab-navigable buttons).
    - Player controls include aria-labels for screen readers.
    - Queue panel toggle exposes aria-expanded and aria-controls where appropriate.
    - Color contrast aims to be WCAG-friendly for both light and dark themes.
    - Respects prefers-color-scheme for the system theme option.

    ---

    ## Known Limitations

    - Browser storage quotas: IndexedDB space can vary by browser and device. Large libraries may hit
      quota limits; the app will surface generic “failed to import” messages if writes fail.
    - Safari & iOS quirks:
      - Service worker and PWA behavior can differ, especially for background audio.
      - Media Session support is more limited than in Chromium-based browsers.
    - Artwork & audio export:
      - Only metadata (not audio/artwork blobs) is exported.
      - Moving your library across devices requires re-importing audio files.
    - Queue drag-and-drop:
      - Queue reordering is currently basic (no advanced drag-and-drop UI). The queue will reflect the
        order in which tracks were added.
    - ID3 parsing:
      - Some exotic or corrupted MP3s may not parse correctly; filenames are used as a fallback.

    ---

    ## Acceptance Test Script

    Use this checklist to manually validate core flows in a browser:

    1. Upload
       - Navigate to /upload.
       - Drag-and-drop or browse to select several MP3 files.
       - Wait for progress to reach 100%; ensure duplicates are marked as skipped.
    2. Songs
       - Navigate to /songs.
       - Confirm imported songs are listed with title, artist, album, duration, and artwork/placeholder.
       - Use search to filter by artist or track name.
       - Change sort between Title, Artist, and Recently added.
    3. Queue & Playback
       - Multi-select a few songs and click Add to queue.
       - Click a song to start playback.
       - Verify the bottom player bar shows artwork, metadata, and a working seek bar.
       - Use play/pause/next/previous buttons; confirm playback changes accordingly.
       - Toggle shuffle and repeat modes from the Now Playing page.
       - Open and close the queue panel and verify the upcoming tracks list.
    4. Playlists
       - Go to /playlists and create a new playlist.
       - Add songs to the playlist (from Songs or by editing playlist contents).
       - Open the playlist detail page; verify songs appear and can be removed.
       - Play the playlist from the detail page.
    5. Offline
       - With some tracks imported, ensure the service worker is active.
       - Turn on Offline mode in DevTools.
       - Refresh the app and navigate between /songs, /playlists, and /now-playing.
       - Confirm metadata is still available and imported songs continue to play.

    If all the above steps succeed, the app is functioning as designed.
# local-music-player
