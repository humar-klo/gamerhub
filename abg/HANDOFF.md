# ABG Handoff (for Discord bot continuation)

_Last updated: 2026-03-01 00:20 GMT_

## Repo / Branch
- Repo: `https://github.com/humar-klo/gamerhub.git`
- Branch: `main`
- Latest pushed commit: `d14e188`

## What was completed in this session

### Core systems
- Reworked progression + UI extensively (new game flow, wave scaling, class picking, hero unlock choices).
- Hero unlock waves set to **50** and **100**.
- Added robust combat watchdog/debug instrumentation and auto-resume rescue logic.

### Talents
- Migrated to **per-hero talent trees**.
- Added **team talent tree** with its own points and modal.
- Team talent points now reward on **first wave clears only**.

### Shop / upgrades
- Replaced team shop with **per-hero gold upgrades**.
- Bulk buy modes:
  - `x5`/`x10` = full planned purchase only
  - `MAX` = buy as many as affordable
- Buttons show total planned cost correctly.

### Combat / targeting
- Added mana economy depth:
  - skill mana costs (base + empowered)
  - class/archetype passive mana spenders
- Added weighted enemy targeting:
  - 70% lowest HP%, 20% random, 10% highest threat
- Added tank viability mechanics:
  - threat
  - taunt duration
- Added revive protection:
  - revive guard turns + shield on revive.

### Classes
- Added new base class: **Priest**.
- Added advanced classes: **Pope** / **Cult Leader**.
- Priest path tuned for healing/support vs debuff/damage split.

### Equipment / loot
- Added rarity: **Godlike** (boss-only, 0.1% chance) with significant stat uplift.
- Improved set bonus readability in equipment panel.
- Paperdoll now uses class art.
- Loot panel set to fixed height with internal scroll.

### Art
- Added unique SVG assets for base/advanced classes (including Priest family).
- Ran distinctiveness + visibility pass on advanced class art.

## Known caveats / watch items
1. Debug badge still occasionally reports idle transitions; diagnostics are better now (`reason`, `errs`, `p/e`, loop resets), but continue monitoring.
2. There are uncommitted/deleted legacy asset entries shown by git status in this local clone (`assets/mage.svg`, `mob1.svg`, etc.). They were not included in commits from this handoff run and may be from prior repo state.
3. `diag.js` exists locally and remains untracked.

## Suggested next steps (Discord bot continuation)
1. Add Discord command hooks for quick telemetry:
   - `/abg-debug`
   - `/abg-state`
   - `/abg-force-resume`
2. Add optional combat event ring buffer (last 50 engine events) to quickly diagnose future idle stalls.
3. Balance pass for Priest + tank meta at waves 40-120.
4. Add Godlike drop announcement UX polish (banner/sfx text cue).
5. Review/decide whether to keep or remove legacy deleted assets before next cleanup commit.

## Quick test checklist
- [ ] Start new game as each base class (Warrior/Ranger/Mage/Priest)
- [ ] Reach wave 50/100 unlock and confirm single-pick only
- [ ] Verify taunt/threat behavior draws enemy focus
- [ ] Verify revive guard prevents instant re-death
- [ ] Verify x5/x10 fixed-cost behavior vs MAX partial buys
- [ ] Verify Godlike drop path (forced dev test if needed)
- [ ] Verify team talent points only on first clears

## Notes for next operator
- If user reports "freeze", ask for full debug badge line including `reason`, `errs`, and `p/e`.
- Prefer incremental commits per subsystem to keep rollback easy.
