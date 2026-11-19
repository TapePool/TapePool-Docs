# TapePool Docs: agent instructions

This repository is the documentation site for TapePool. Read `README.md` for the layout and the build.

## Scope

- Work only on documentation in this repository.
- `D:\Tape Pool` (the TapePool repository) is **reference-only**: read it to verify facts, never edit, commit or run
  write-side operations there. Its dev server may be started to take screenshots from fixtures (no wallet, no chain writes).
- Never copy or disclose private keys, tokens, `.env` contents or RPC keys.

## Content rules

- Facts come from `D:\Tape Pool\docs\SPEC.md` (normative), the redeploy launch values and the app's own copy, never from
  memory. Where `CLAUDE.md` or the README of the TapePool repo disagree with the amended SPEC, the SPEC wins.
- English and Chinese pages change together. Chinese copy follows the `tapepool-content-cn` skill (glossary, claims,
  docs) and must pass `npm run check:cn` with 0 errors.
- Caps as shares of the pool, not BEM amounts. No return promises, no bare "no liquidation" (pair it with the seize path),
  no unscoped "first", no audit wording (owner, 2026-11-19: do not mention audit at all).
- Never use the names listed in the "Never put the names" rule of `D:\Tape Pool\CLAUDE.md`.
- Contract addresses (owner's decision, 2026-11-19): the Contracts page (`#contracts`) lists only TapePool's own contracts
  that are in use now (no retired pools or feeds), each with its chain and explorer link, taken from `D:\Tape Pool\script\Addresses.sol` and `CLAUDE.md`. The build
  rejects an address that is not recorded there. TapeOut, BEM and LayerZero contracts are not listed as ours.
- The docs go public together with the app at `https://app.tapepool.io` (owner, 2026-11-19): the app is live, never
  "coming soon". Features the app still lacks (Telegram alerts, the FAB pool) may still be marked as planned.
- Do not bring back the "Smart contracts carry risk: you can lose funds" sentence; the owner removed it.
- No em dash in English copy. Every app screenshot is labelled as sample data.
- Run `node build.mjs` after every change; it refuses to write the page when a rule breaks.
