# TapePool Docs

Documentation site for TapePool, the BEM lending pool on X Layer for TapeOut miners. English and 中文 in one page.

The built `index.html` is self-contained except for the files next to it (`img/`, `fonts/`, favicons), so the folder can
be served by any static host. No packages are needed.

```bash
npm run build      # validates the content and writes index.html
npm run preview    # http://127.0.0.1:4320
npm run check:cn   # the tapepool-content-cn checker on the Chinese pages
```

## Deploy

https://docs.tapepool.io runs on Railway, deployed from the `main` branch of
[TapePool/TapePool-Docs](https://github.com/TapePool/TapePool-Docs). Every push to `main` deploys.
Railway serves the committed `index.html` with `node preview.mjs`; it does not rebuild the page, because the content
checks need the TapePool repository next to this one. So after editing `src/`, run `npm run build` and commit
`index.html` with the change.

The service settings live in Railway (project `tapepool-docs`, service `tapepool-docs`), not in a config file: build
command `echo …` (no build), start command `node preview.mjs`, health check `/`, restart on failure.

## Layout

| Path | What it is |
|---|---|
| `src/pages.js` | English pages: `id`, `group`, `title`, optional `nav`, `lead`, `body` (HTML) |
| `src/pages.zh.js` | Chinese pages, keyed by the same ids. Every English page needs one |
| `src/helpers.js` | `shot()` (app screenshot, labelled sample data), `art()` (illustration), `table()`, `addr()` (address with explorer link), the contract addresses `C` and the app link `APP` |
| `src/template.html` | Page shell: sidebar, search, language switch, theme, image zoom, client-side router |
| `src/styles.css` | Styles, TapePool brand colours, light and dark |
| `build.mjs` | Builds `index.html`; refuses to write it when a content rule breaks (below) |
| `preview.mjs` | Local server; serves the page for `/` and any clean path (`/borrow`) |
| `img/app/`, `img/app/zh/` | App screenshots, English and Chinese UI |
| `img/diagrams/`, `img/diagrams/zh/` | Illustrations from the TapePool content kit (a Chinese version where one exists) |
| `img/brand/`, favicons, `fonts/` | From `Tape Pool/docs/brand` and the app's self-hosted fonts (SIL OFL, licences in `fonts/`) |
| `tools/screenshots.mjs`, `tools/shots.json` | Re-takes the app screenshots from the app's development fixtures |
| `tools/check-cn.mjs` | Extracts the Chinese pages and runs the content checker |

## Pages and links

A page is opened by its hash (`#borrow`) or a clean path (`/borrow`). A section has `#borrow/2` (the third `h2`).
Language: `?lang=zh` or `?lang=en`, then the saved choice (`tp-lang`, the key the TapePool app uses: `cn` or `en`), then
the browser languages.

## Content rules the build enforces

- Every page has all fields, ids are unique, every English page has a Chinese twin.
- Every `#link` resolves, every image exists and has alt text.
- No stale launch value: the old 0.75% / 1.5% fees, 0.031 OKB, 0.003 BEM, caps written as BEM amounts.
- No return or safety promise, no bare "no liquidation", no unscoped "first", no audit wording. In Chinese: no
  无清算 / 年化 / 收益率 / 唯一, no 你 (docs use 您), no 抵押, no exclamation marks.
- No "app coming soon": the docs go public together with the app at https://app.tapepool.io.
- No name from the "Never put the names" rule of `Tape Pool/CLAUDE.md` (read at build time, never stored here).
- Every contract address (they live in `src/helpers.js`, `C`) appears, letter case included, in `Tape Pool/script/Addresses.sol`
  or `Tape Pool/CLAUDE.md`, and the English and Chinese twins of a page list the same addresses.

## Facts

Facts come from the TapePool repository, which is read-only for this repo: `docs/SPEC.md` (normative, amended through
redeploy 4), the redeploy 4 launch values, `docs/RISK_DISCLOSURE.md`, the app's own copy, and the public launch posts.
Live values at the time of writing: fees 0.25% (7 days) and 0.5% (14 days), minimum fee 0.001 BEM, minimum advance
0.01 BEM, late fee 0, operating fee 0 OKB, LayerZero fees sponsored by the keeper through 2026-12-31.

## Screenshots

`tools/screenshots.mjs` drives the installed Edge through the app's own Playwright against the app's dev server with
`?fixture=<name>`. It rewrites the fixtures' first-MVP parameters to the launch values in flight, so no screenshot shows an
old fee, and edits nothing in the app repository. Every screenshot is captioned "Sample data" / "示例数据".

```bash
npm --prefix "../Tape Pool/app" run dev -- --port 5180 --strictPort   # fixtures only, no wallet
npm run shots                                                          # English and Chinese
```
