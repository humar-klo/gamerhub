# HANDOFF — GamerHub + ABG Progress Snapshot

_Last updated: 2026-02-28_

## Core setup
- Primary site repo/folder: `C:\Users\Lobster\Desktop\night-skeleton`
- GitHub repo: `https://github.com/humar-klo/gamerhub`
- GitHub Pages:
  - EN default: `https://humar-klo.github.io/gamerhub/`
  - IS page: `https://humar-klo.github.io/gamerhub/is.html`
- Netlify was used earlier, but hit free-plan deploy limits; GitHub Pages is current stable host.

## User preference / policy highlights
- Safe mode active generally.
- Special exception: **auto-deploy approved for GamerHub web edits** (unless user asks for draft-only).
- New standing quality rule: when adding/changing game content, refine all titles to similar quality (no uneven polish).
- User prefers practical, dependable game advice over FAQ fluff.

## Website work completed
- Dark-themed GamerHub site with tabbed game selector.
- Selector behavior updated multiple times for mobile ergonomics.
- Sticky header includes currently selected game chip.
- "Back to top" anchor fixed.
- Added many game tabs with 30-item advice sets and phase grouping.
- Added Titan Quest 2 tab with full 30-item set in EN+IS.

## Latest website-only iteration (2026-02-28)
- Improved accessibility and navigation:
  - Added skip links on `index.html` and `is.html`
  - Added `aria-live` support to active-game chip updates
  - Added keyboard tab navigation (arrow keys + Home/End) with proper roving focus behavior
- Improved mobile UX/readability in `styles.css`:
  - Better tab button text wrapping
  - Single-column tab list on narrow phones
  - Stronger visible focus style for language switch button
- EN/IS parity cleanup:
  - Standardized tab panel heading style consistency
  - Rebuilt `script-is.js` from clean parity baseline to remove mixed-language rough phrasing/encoding artifacts
  - Preserved Icelandic interaction labels (selector text + phase headings)
- Added `CHANGELOG.md` for concise pass-by-pass notes.
- No changes made under `/abg`.

## Language system state
- Removed Google Translate popup approach.
- Implemented hardcoded dual-page language strategy:
  - `index.html` = English default
  - `is.html` + `script-is.js` = Icelandic
- Language switch is explicit EN/IS button in header linking between pages.
- IS text quality has undergone multiple passes; still may need incremental native-style polishing where phrasing feels mixed.

## Game content structure
- Dynamic content source files:
  - EN: `script.js`
  - IS: `script-is.js`
- Each game expected to follow 30 tips split by phase:
  - Early (1–10)
  - Mid (11–20)
  - End (21–30)

## ABG project (browser auto-battler)
- Path: `C:\Users\Lobster\Desktop\night-skeleton\abg`
- Live URL: `https://humar-klo.github.io/gamerhub/abg/`
- Version progressed to **v0.3** with:
  - Forest-style battlefield visual background
  - Animated/moving sprites
  - Auto-wave progression until boss gates (every 5 waves)
  - Loot drops and talents
  - Save/load via localStorage
  - Balance tuning pass to make early waves easier

### ABG local vs hosted note
- User observed local rendering looked more correct than Pages at times.
- Likely causes: CDN/cache delay; hard refresh recommended.

## Most recent ABG balance adjustments
- Stronger party starting stats.
- Softer early enemy scaling.
- Increased wave rewards.
- Stronger between-wave auto-heal.
- Shop buffs improved and cheaper.
- Wipe penalty reduced.

## Suggested next steps
1. ABG difficulty selector (Chill/Normal/Hard).
2. ABG clearer visual assets (character motion states/attack VFX).
3. Add build/version stamp on ABG page to compare local vs hosted instantly.
4. Final IS language cleanup pass for style consistency per game section.
5. Keep EN/IS parity checklist for every future content update.
