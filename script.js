// Night Vibes interactions
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const tabButtons = document.querySelectorAll('.tab-btn');
const activeGameChip = document.getElementById('active-game-chip');
const selectorToggle = document.getElementById('selector-toggle');
const selectorPanel = document.getElementById('game-selector-panel');

const tabPanels = {
  nms: document.getElementById('panel-nms'),
  nioh: document.getElementById('panel-nioh'),
  hytale: document.getElementById('panel-hytale'),
  valheim: document.getElementById('panel-valheim'),
  endfield: document.getElementById('panel-endfield'),
  poe2: document.getElementById('panel-poe2'),
  kcd2: document.getElementById('panel-kcd2'),
  wwm: document.getElementById('panel-wwm'),
  fo76: document.getElementById('panel-fo76'),
  elden: document.getElementById('panel-elden')
};

const tabLabels = {
  nms: "No Man's Sky",
  nioh: "Nioh 3",
  hytale: "Hytale",
  valheim: "Valheim",
  endfield: "Arknights: Endfield",
  poe2: "Path of Exile 2",
  kcd2: "Kingdom Come: Deliverance 2",
  wwm: "Where Winds Meet",
  fo76: "Fallout 76",
  elden: "Elden Ring"
};

function switchTab(tabName) {
  tabButtons.forEach(btn => {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  Object.entries(tabPanels).forEach(([key, panel]) => {
    if (!panel) return;
    const active = key === tabName;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });

  if (activeGameChip && tabLabels[tabName]) {
    activeGameChip.textContent = tabLabels[tabName];
  }
}

tabButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

if (selectorToggle && selectorPanel) {
  const toggleSelector = () => {
    const isOpen = selectorPanel.classList.toggle('open');
    selectorToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    selectorToggle.textContent = isOpen ? 'Game selector ▾' : 'Game selector ▸';
  };

  selectorToggle.addEventListener('click', toggleSelector);
  selectorToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelector();
    }
  });
}

function getGoogTransLang() {
  const m = document.cookie.match(/(?:^|; )googtrans=\/[^/]+\/(\w+)/);
  return m ? m[1] : 'en';
}

function setGoogTransLang(lang) {
  document.cookie = `googtrans=/auto/${lang};path=/`;
  document.cookie = `googtrans=/auto/${lang};domain=${location.hostname};path=/`;
  location.reload();
}

const langToggle = document.getElementById('lang-toggle');
if (langToggle) {
  const currentLang = getGoogTransLang();
  langToggle.textContent = currentLang === 'is' ? 'EN' : 'ÍS';
  langToggle.title = currentLang === 'is' ? 'Switch to English' : 'Skipta yfir á íslensku';

  langToggle.addEventListener('click', () => {
    const next = getGoogTransLang() === 'is' ? 'en' : 'is';
    setGoogTransLang(next);
  });
}

const faqData = {
  nms: [
    ["1) Best first-session priorities?", "Repair launch systems, unlock the Anomaly path, and buy 1-2 exosuit slots at each station/anomaly stop."],
    ["2) Fastest reliable early Units?", "Install scanner upgrades early and chain station missions that overlap with exploration you already plan to do."],
    ["3) How should I handle early inventory pain?", "Keep active crafting inputs in regular slots, bulk mats in cargo, and sell low-value clutter every station visit."],
    ["4) Is a base mandatory right away?", "Build a compact utility base first (teleporter, refiner, storage, power), then expand only after routes are stable."],
    ["5) Best early multitool focus?", "Scanner income + mining-beam comfort first, then one consistent combat line."],
    ["6) Solo or multiplayer for week one?", "Solo is fully viable; add co-op only if it speeds your goals rather than distracting routing."],
    ["7) How do I avoid resource starvation?", "Never spend all core fuels at once; keep emergency launch fuel and life-support inputs before long trips."],
    ["8) What story path unlocks key systems?", "Follow the early Artemis/Awakenings flow until anomaly and core utility systems are consistently available."],
    ["9) Should I chase rare ships immediately?", "Not yet. Stabilize income and slots first so ship hunts are efficient instead of disruptive."],
    ["10) Most dependable early rule?", "Progression over perfection: unlock systems first, optimize later."],

    ["11) What defines healthy midgame in NMS?", "Stable nanite loop, reliable unit income, and logistics that let you switch activities quickly."],
    ["12) Best midgame money routes?", "Pick one primary loop (frigate expeditions, salvage loops, or crafted goods) and optimize it end-to-end."],
    ["13) How should I use freighters midgame?", "Treat freighter as moving HQ: storage centralization, expedition uptime, and portable build utility."],
    ["14) Can I move bases cleanly?", "Yes—rebuild in the new location, transfer essential infrastructure, and preserve teleport links for old farms."],
    ["15) How do I keep upgrades patch-proof?", "Prioritize universal value: slot count, logistics speed, survivability, and consistent income over gimmick loops."],
    ["16) Best way to manage Sentinels?", "Avoid prolonged escalation unless intentional; break line-of-sight and reset when objective is exploration or farming."],
    ["17) How many ships should I maintain?", "Keep role-based ships only if each has clear purpose; otherwise maintenance overhead slows progression."],
    ["18) Are settlements a main progression engine?", "Usually side content value, not top-tier account acceleration."],
    ["19) Should I use coordinates/glyphs midgame?", "Use them for targeted hunts or bottlenecks; free exploration remains best for discovery sessions."],
    ["20) Midgame anti-burnout habit?", "Rotate one economy loop, one exploration goal, and one build task per session."],

    ["21) Endgame resource strategy?", "Automate extraction/refining where possible, then spend playtime on high-value goals, not manual grind."],
    ["22) Best long-term optimization priority?", "Route compression: fewer menu trips, fewer transfers, faster travel between recurring objectives."],
    ["23) What should I min-max first?", "Main ship utility + exosuit slots + freighter logistics before cosmetic mega-projects."],
    ["24) Are expeditions worth scheduling around?", "Yes for unique account rewards; verify dates through official channels and prioritize milestone efficiency."],
    ["25) How do I prep for major updates safely?", "Keep spare key resources and avoid overcommitting to one brittle farm pipeline."],
    ["26) Best endgame session format?", "Start with maintenance (expeditions/storage), run one focused objective, finish with optional exploration."],
    ["27) Is permadeath worth trying?", "Great if you enjoy planning discipline; keep risk windows short and exits preplanned."],
    ["28) How to keep late game fun?", "Set themed projects (fleet, base, fauna, photo routes) instead of pure efficiency grind."],
    ["29) Reliable expert rule?", "Build systems that still work when your mood, patch, or objective changes."],
    ["30) Core dependable advice?", "Use NMS as a logistics game first and a collection game second; progression becomes smoother and less fragile."]
  ],
  nioh: [
    ["1) Is this guidance safe if Nioh 3 details change?", "Yes—focus on proven Nioh fundamentals: Ki control, spacing, defensive discipline, and punish timing."],
    ["2) Biggest early error?", "Spending all Ki on offense and getting caught in recovery with no defensive option."],
    ["3) What should I train first?", "Guard timing, Ki pulse rhythm, and one reliable combo route per stance."],
    ["4) Should beginners lock one weapon?", "Main one weapon first, carry a secondary for matchup coverage, and avoid constant swapping."],
    ["5) Light or heavy loadout early?", "Choose the load that preserves movement and Ki comfort; control beats raw armor greed."],
    ["6) Are magic/ninjutsu tools optional?", "Optional but high-value; even light utility investment improves consistency and recovery windows."],
    ["7) How should I spend early stats?", "Meet requirements, stabilize survivability/Ki, then scale damage after baseline comfort is stable."],
    ["8) Best way to learn bosses?", "Run short attempts focused on identifying 2-3 safe punish windows and retreat patterns."],
    ["9) Dodge only or block too?", "Use both. Mixed defense is safer than committing to one answer for every pattern."],
    ["10) Core early-game rule?", "Never enter a dangerous exchange without enough Ki to defend afterward."],

    ["11) Midgame progression focus?", "Refine consistency: cleaner stance transitions, fewer greedy strings, better utility timing."],
    ["12) Should I hard-optimize gear midgame?", "Target high-impact upgrades first; full min-max can wait until build identity is fixed."],
    ["13) How important are set bonuses midgame?", "Helpful, but only if they support your actual combat rhythm and survivability."],
    ["14) Soul matching now or later?", "Use selectively; avoid heavy resource burn on gear you’ll replace soon."],
    ["15) How do I handle repeated deaths?", "Lower complexity: shorten combos, simplify tools, and re-establish safe defensive habits."],
    ["16) Is co-op good for learning?", "Great for smoothing progression, but still practice solo reps to learn enemy telegraphs cleanly."],
    ["17) Best loot management habit?", "Dismantle/cull aggressively with clear rules so inventory never blocks session momentum."],
    ["18) Are status builds reliable?", "Yes when they support uptime and safety, not when they force risky overextensions."],
    ["19) Midgame skill-tree priority?", "Core passives, Ki economy, and repeatable bread-and-butter options before niche tech."],
    ["20) Midgame efficiency benchmark?", "Fewer avoidable hits, faster resets, and consistent clears under pressure."],

    ["21) When to start full min-max?", "After campaign stability, when gear turnover slows and your playstyle is locked in."],
    ["22) Endgame build philosophy?", "Optimize for reliability first, then stack damage once defense and Ki flow are solved."],
    ["23) How often should I pivot builds?", "Deliberately and rarely; frequent pivots usually erase mastery gains."],
    ["24) What separates strong players late game?", "Decision quality under pressure: when to disengage, reset Ki, and re-enter safely."],
    ["25) Is ranged utility still relevant endgame?", "Yes—for controlled pulls, tempo resets, and safer multi-target handling."],
    ["26) Best pre-boss checklist?", "Load/agility check, healing stock, shortcut readiness, utility setup, and first-phase plan."],
    ["27) How to patch-proof your setup?", "Keep one flexible slot in gear/tooling so balance changes don’t invalidate the whole build."],
    ["28) Best anti-tilt routine?", "After two sloppy runs, pause, review one mistake category, and return with a single correction target."],
    ["29) Reliable long-term progression order?", "Ki stability -> defense consistency -> punish uptime -> damage optimization."],
    ["30) Core dependable advice?", "Master tempo control first; everything else in Nioh-style combat scales from that."]
  ],
  hytale: [
    ["1) Best first-week focus?", "Set up one stable progression loop first: reliable gear upgrades, movement comfort, and resource flow."],
    ["2) Biggest early mistake players make?", "Trying to optimize everything at once instead of mastering one complete loop."],
    ["3) Should I prioritize combat or building first?", "Prioritize whichever unlocks your bottleneck, but keep both progressing so account/world growth stays balanced."],
    ["4) How do I avoid wasting early resources?", "Spend on upgrades that improve consistency (survivability, mobility, core tools), not flashy side systems."],
    ["5) Is solo progression viable?", "Yes, but co-op can accelerate farming and difficult content if coordination is good."],
    ["6) Best way to choose a build path?", "Pick one playstyle that feels natural, then commit long enough to learn its breakpoints."],
    ["7) How many systems should I grind at once?", "One main system plus one support system is usually optimal early."],
    ["8) How do I evaluate if a guide is good?", "Check patch/version date, test scope, and whether tradeoffs are explained clearly."],
    ["9) Most dependable progression principle?", "Consistency beats spikes: steady upgrades outperform risky high-roll gambles."],
    ["10) Should I chase early meta routes blindly?", "No. Verify they still work on current patch and match your playstyle."],
    ["11) How to reduce downtime in sessions?", "Batch objectives: gather, craft, and complete nearby goals in one route."],
    ["12) Is inventory discipline important?", "Yes. Clean inventory flow prevents wasted time and accidental resource starvation."],
    ["13) Best habit for survivability?", "Always keep fallback tools ready and avoid entering new zones underprepared."],
    ["14) How do I recover from progression stalls?", "Identify the single biggest blocker and solve that before broad grinding."],
    ["15) Should I specialize early or stay flexible?", "Specialize enough to gain momentum, but keep a flexible backup option."],
    ["16) Is movement optimization worth practicing?", "Yes. Better movement raises both survival and farming efficiency."],
    ["17) How do I avoid burnout?", "Set short milestones, rotate activities, and stop before efficiency collapses."],
    ["18) Best way to handle difficult encounters?", "Learn patterns in short reps, then return with one targeted adjustment."],
    ["19) Should I hoard all materials?", "No. Hoard key bottleneck materials, spend the rest to maintain momentum."],
    ["20) What is a reliable upgrade priority order?", "Survivability -> core damage/utility -> quality-of-life upgrades."],
    ["21) Is co-op always faster?", "Only when roles are clear; disorganized co-op can be slower than solo efficiency."],
    ["22) How to keep builds from feeling weak midgame?", "Recheck scaling path, upgrade breakpoints, and synergy gaps before rerolling."],
    ["23) Should I reset often when experimenting?", "Experiment in controlled windows; constant resets destroy long-term momentum."],
    ["24) Best way to prep for new patch changes?", "Keep flexible resources banked and avoid overcommitting to one fragile route."],
    ["25) How to judge whether content is worth farming?", "Measure reward per time and whether it solves current progression needs."],
    ["26) Is optimization worth it for casual players?", "Light optimization gives big gains without turning the game into spreadsheet work."],
    ["27) What should advanced players optimize first?", "Route efficiency, upgrade sequencing, and low-risk high-value repeatables."],
    ["28) How do I know when to pivot strategy?", "Pivot when your current loop stops giving meaningful gains per session."],
    ["29) Most dependable long-term habit?", "Review your progression plan every few sessions and trim low-value activities."],
    ["30) Core dependable advice?", "Play with intention: stable loops, clear priorities, and patch-aware adjustments win long-term."]
  ],
  valheim: [
    ["1) Best first-day priority?", "Secure shelter, basic food variety, and a safe spawn-adjacent workbench loop before long exploration."],
    ["2) Most common new-player mistake?", "Rushing bosses without proper food tiers, rested buff uptime, and a backup recovery kit."],
    ["3) Is rested buff really that important?", "Yes. It massively improves stamina/health recovery and should be maintained almost constantly."],
    ["4) Best early weapons?", "Use what you can sustain reliably; spear/bow/club combinations are practical early depending on comfort."],
    ["5) Should I build main base early?", "Build a modest functional base first, then expand after resource routes are mapped."],
    ["6) How important is food progression?", "Critical. Better food is one of the largest survivability and progression multipliers."],
    ["7) Is farming worth doing early?", "Yes once unlocked—consistent food supply removes major progression friction."],
    ["8) Solo or co-op easier?", "Co-op smooths combat and hauling, but solo is fully viable with good prep discipline."],
    ["9) Best way to reduce corpse-run pain?", "Carry portal mats, maintain backup gear, and never overextend without exit routes."],
    ["10) Should I overbuild defenses early?", "Basic perimeter and awareness usually beat expensive over-fortification too early."],
    ["11) Is bow mandatory?", "Not mandatory, but ranged control is extremely valuable in many encounters."],
    ["12) How to approach each new biome?", "Scout edges first, test enemies, and upgrade gear before deep commits."],
    ["13) Best stamina management habit?", "Never empty stamina bar completely; reserve enough for defense and retreat."],
    ["14) Is parry timing worth learning?", "Yes, parry consistency can dramatically improve combat safety and efficiency."],
    ["15) Best transport strategy mid-game?", "Build route infrastructure (roads/ports/portals) to cut repeat travel costs."],
    ["16) Should I hoard everything?", "No. Keep organized core materials and convert surplus into build/progression value."],
    ["17) Are portals overpowered?", "They’re intended logistics tools; using them smartly reduces grind fatigue."],
    ["18) Best anti-frustration tip?", "Split risky trips into short objectives with reliable return plans."],
    ["19) How to prep for boss attempts?", "Food tier, resist prep, repair check, and a clean arena matter more than bravado."],
    ["20) Can I skip base aesthetics?", "Yes early. Function-first base design accelerates progression."],
    ["21) Best way to train combat confidence?", "Practice enemy patterns in controlled fights near safe fallback zones."],
    ["22) Is shield usage worth it?", "Yes, especially while learning timings and threat spacing."],
    ["23) How to keep co-op groups efficient?", "Assign roles: scout, builder, farmer, logistics, and rotate when bored."],
    ["24) What to upgrade first usually?", "Tools + survivability + mobility upgrades before cosmetic expansion."],
    ["25) Should I chase guides for everything?", "Use guides for bottlenecks, but leave room for discovery so progression stays fun."],
    ["26) How to reduce grind feeling?", "Batch gather runs, optimize routes, and avoid single-resource tunnel vision."],
    ["27) Is base location choice huge?", "Yes. Access to mixed biomes/routes saves massive long-term time."],
    ["28) Most dependable late-game habit?", "Always prep redundancies: spare gear, food reserves, and route backups."],
    ["29) Is death penalty manageable?", "Yes, with planning. It’s harsh but fair once logistics discipline is built."],
    ["30) One meta truth for Valheim?", "Preparation beats reflexes more often than not."]
  ],
  endfield: [
    ["1) What should I prioritize in my first week?", "Build one stable core squad first, unlock essential systems, then branch into specialized teams."],
    ["2) Biggest progression mistake new players make?", "Spreading resources across too many units early and delaying core-team power spikes."],
    ["3) How many units should I seriously invest in early?", "Usually one main team plus 1–2 flex units for mechanics coverage."],
    ["4) Should I chase every new banner?", "No. Pull around role gaps and long-term account plan, not hype cycles."],
    ["5) What matters more: rarity or team fit?", "Team fit and role synergy usually outperform raw rarity."],
    ["6) Best way to spend stamina efficiently?", "Prioritize account-unlock materials and guaranteed progression resources before luxury farming."],
    ["7) Is daily consistency really better than long sessions?", "Yes. Reliable daily progression compounds harder than occasional marathon play."],
    ["8) Should I rush story or side systems first?", "Push story until key systems unlock, then balance progression and resource farming."],
    ["9) Best way to avoid account stagnation?", "Audit bottlenecks weekly: damage check, sustain check, and upgrade material shortages."],
    ["10) How do I choose who to level next?", "Pick units that solve current blockers, not units that only increase ceiling."],
    ["11) Is auto-battle enough for progression?", "Use auto for repetition, but learn difficult mechanics manually to avoid bad habits."],
    ["12) When should I start optimizing gear/relics?", "After your core team can clear routine content reliably."],
    ["13) Should F2P players copy spender strategies?", "No. Resource pacing and pull discipline are more important for F2P stability."],
    ["14) How do I avoid wasting premium currency?", "Set pull budgets in advance and stick to them even during hype banners."],
    ["15) What is a dependable team-building rule?", "Cover essential roles first: sustained damage, survivability, utility/control."],
    ["16) How do I handle difficulty spikes?", "Fix role gaps and upgrade breakpoints before brute-force retries."],
    ["17) Is rerolling worth it long-term?", "Only if done early with a clear target; otherwise lost progression usually costs more."],
    ["18) Should I hoard all resources forever?", "No. Hoard selectively, but spend enough to keep momentum and unlock content."],
    ["19) How do I evaluate if a unit is truly good?", "Look at role compression, consistency, and upgrade cost efficiency in real content."],
    ["20) Best way to farm event shops?", "Prioritize highest-value limited resources first, then fill with general progression items."],
    ["21) How many teams do I need for endgame-style content?", "Develop one excellent team first, then a second specialized roster."],
    ["22) Is min-maxing early account stats worth it?", "Only after your baseline progression loop is stable and repeatable."],
    ["23) What should I do when community advice conflicts?", "Prefer advice with patch/date stamps and clear testing methodology."],
    ["24) How do I avoid burnout?", "Set weekly milestones, stop after high-value tasks, and skip low-impact grind."],
    ["25) Should I invest in niche units early?", "Usually no—build broad reliability before niche optimization."],
    ["26) What is the safest long-term progression philosophy?", "Consistency over spikes: steady upgrades beat feast-or-famine resource dumps."],
    ["27) How often should I review my account plan?", "After each major patch/event cycle or when progression stalls."],
    ["28) Best way to prep for new content patches?", "Bank core upgrade materials and keep one flexible slot in your investment plan."],
    ["29) What is the highest-value habit for account strength?", "Never let stamina and daily core tasks go to waste."],
    ["30) Core dependable advice?", "Build a stable foundation, spend with intention, and adapt quickly to patch changes."]
  ],
  poe2: [
    ["1) Is Path of Exile 2 beginner-friendly?", "It is deep and demanding; beginner success comes from following a coherent build plan early."],
    ["2) Biggest early mistake?", "Improvising passive trees without a plan, then hitting scaling walls."],
    ["3) Should I use a build guide?", "Yes for first character—then branch out once you understand itemization and defenses."],
    ["4) Is offense enough to carry progression?", "No. Layered defenses + recovery + uptime matter as much as DPS for stable progression."],
    ["5) Best first-character mindset?", "Prioritize consistency and survivability over flashy but fragile damage paths."],
    ["6) Is currency spending early dangerous?", "Yes. Save high-value currency until upgrade value is clear."],
    ["7) How important are resistances?", "Critical. Keep resist and core defenses healthy through every progression phase."],
    ["8) Should I craft early or buy upgrades?", "Use low-risk crafting for basics; buy key upgrades when value is obvious."],
    ["9) Fastest way to improve build quality?", "Identify weakest slot and biggest defensive gap first, then patch systematically."],
    ["10) Is movement skill priority high?", "Yes—mobility and repositioning greatly improve survival and clear speed."],
    ["11) How to avoid stash chaos?", "Sort by function: crafting base items, sellable rares, currency, and build-critical gear."],
    ["12) Should I copy endgame builds too early?", "No, many require expensive breakpoints and feel bad before completion."],
    ["13) Best way to learn boss fights?", "Short focused reps: learn telegraphs and safe windows instead of brute forcing."],
    ["14) How to evaluate item upgrades quickly?", "Check whether upgrade solves current bottleneck (damage uptime, defense gap, sustain)."],
    ["15) Is group play always better for progress?", "Not always. Coordination quality matters more than party size."],
    ["16) What kills most new players in ARPG endgame?", "Ignoring layered defense and relying on damage-only logic."],
    ["17) Should I reroll often?", "Only when build is structurally broken; frequent rerolls slow mastery."],
    ["18) Is trade mandatory?", "Depends on goals, but trade usually accelerates progression significantly."],
    ["19) How to pick farming strategy?", "Choose content your build handles safely and repeatedly, then scale efficiency."],
    ["20) Best anti-burnout approach?", "Set short economic goals and rotate activities instead of endless one-loop grinding."],
    ["21) Are tier lists enough for decisions?", "No. Build comfort and budget constraints matter as much as tier rank."],
    ["22) Should I chase perfect items early?", "No. Incremental upgrades outperform perfection chasing for most players."],
    ["23) How to keep deaths from snowballing?", "Pause, identify failure source, and fix one defensive weakness at a time."],
    ["24) Is flask/micro-management worth it?", "Yes, good utility management is a major performance multiplier."],
    ["25) Most dependable currency rule?", "Spend where it unlocks progression, not where it looks flashy."],
    ["26) How to know when build is map-ready?", "Stable clear speed, survivable boss attempts, and no frequent one-shots."],
    ["27) Best early market behavior?", "Sell useful mid-tier items quickly and avoid overholding speculative inventory."],
    ["28) Should I force meta if I dislike playstyle?", "Usually no—consistency drops when the build doesn’t fit your rhythm."],
    ["29) Reliable progression priority order?", "Defenses -> sustain -> damage scaling -> quality-of-life."] ,
    ["30) Core dependable advice?", "Run a coherent plan, patch weaknesses early, and upgrade deliberately."]
  ],
  kcd2: [
    ["1) Is KCD2 combat skill-based?", "Yes. Timing, spacing, stamina control, and preparation matter far more than rushing."],
    ["2) Best opening habit?", "Treat early hours as a training phase: stabilize money, food, gear condition, and combat fundamentals before ambition spikes."],
    ["3) Is gear enough to win hard fights?", "No. Skill progression and fight selection matter heavily."],
    ["4) Should I pick every fight?", "No. Avoid bad odds, pick cleaner engagements, and use terrain advantage."],
    ["5) Is stamina management crucial?", "Absolutely—empty stamina often means immediate punishment."],
    ["6) Best way to make money early?", "Reliable legal loops and quest rewards beat risky crime spirals early on."],
    ["7) How to train combat efficiently?", "Short focused spar sessions and controlled encounters build consistency."],
    ["8) Should I neglect speech/utility skills?", "No. Non-combat options save time, money, and risk."],
    ["9) Is stealth viable?", "Yes, when approached patiently with visibility/noise discipline."],
    ["10) Best inventory discipline rule?", "Carry what supports your current objective; avoid over-encumbrance penalties."],
    ["11) How to prep before dangerous quests?", "Repair gear, stock healing/food, and save with a clear fallback route."],
    ["12) Is horse management important?", "Yes, mobility and storage quality significantly affect world efficiency."],
    ["13) Should I rush main story?", "Pacing side progression often produces smoother main-story difficulty."],
    ["14) How to reduce frustration in duels?", "Focus on defense windows and clean counter timing before aggression."],
    ["15) Is reputation impactful?", "Usually yes—social consequences influence options and outcomes."],
    ["16) Best anti-death spiral strategy?", "Reset tempo, avoid tilt-fights, and return with better prep."],
    ["17) Is lockpicking/theft worth learning?", "Useful, but keep legal consequences and roleplay goals in mind."],
    ["18) Should I min-max instantly?", "No. Learn systems first, optimize later."],
    ["19) Best way to learn map routes?", "Use repeated short loops between high-value hubs before long trips."],
    ["20) Is heavy armor always better?", "Not always—mobility and stamina costs can outweigh raw protection."],
    ["21) How to handle multiple enemies?", "Disengage, funnel space, and avoid open surround situations."],
    ["22) Is bow use worth practicing?", "Yes, ranged control can simplify difficult engagements."],
    ["23) Most dependable social strategy?", "Invest in speech options and read quest context before committing."],
    ["24) How to manage saves smartly?", "Use regular progression checkpoints and avoid huge unsaved risk chains."],
    ["25) Best way to keep roleplay + efficiency?", "Set character rules, then optimize within those boundaries."],
    ["26) Should I grind one skill only?", "Balanced development usually gives better overall mission flexibility."],
    ["27) How to recover bad reputation?", "Use consistent lawful behavior, complete helpful tasks, and avoid repeat offenses."],
    ["28) Is night gameplay safer?", "Situational—better for stealth, riskier for visibility/navigation."],
    ["29) Most reliable progression priority?", "Survivability, stable income, travel efficiency, then luxury upgrades."],
    ["30) Core dependable advice?", "Play patient, prepare well, and respect the simulation."]
  ],
  wwm: [
    ["1) Best first-week priority?", "Build a stable core loop: one reliable combat setup, one income/material route, and one mobility route."],
    ["2) Biggest early mistake?", "Spreading upgrades across too many systems before a core build is functional."],
    ["3) Should I min-max immediately?", "No. Early consistency and survivability beat fragile high-risk optimization."],
    ["4) How do I choose a build path?", "Pick one playstyle that feels natural, then commit long enough to hit key power breakpoints."],
    ["5) What should I upgrade first?", "Prioritize survivability, core damage uptime, and movement/control tools before niche upgrades."],
    ["6) Is exploration-first viable?", "Yes, if you pair it with practical progression goals so exploration feeds upgrades."],
    ["7) Best way to avoid resource waste?", "Spend on upgrades that solve current bottlenecks, not on speculative future builds."],
    ["8) Should I use guides right away?", "Use them for bottlenecks only; avoid copying full routes blindly without patch/version checks."],
    ["9) How to evaluate whether a guide is reliable?", "Prefer guides with patch-date tags, test conditions, and explicit tradeoffs."],
    ["10) Most dependable early-game rule?", "One strong build online first; everything else is secondary."],

    ["11) What defines good mid-game progression?", "Consistent clear speed, low death rate, and repeatable resource gains per session."],
    ["12) How many builds should I run mid-game?", "One primary build plus one flexible backup is usually optimal."],
    ["13) Best way to break progression plateaus?", "Identify the single biggest blocker (damage, defense, or sustain) and fix that first."],
    ["14) Is co-op always more efficient?", "Only with clear role coordination; disorganized co-op often wastes time."],
    ["15) Should I hoard all materials?", "No. Hoard bottleneck resources; spend the rest to keep momentum."],
    ["16) How to improve fight consistency?", "Learn enemy patterns in short reps and reduce greedy punish attempts."],
    ["17) Is gear optimization worth doing mid-game?", "Yes, but focus on high-impact slots first instead of full-set perfection."],
    ["18) Best anti-burnout strategy?", "Run short objective-based sessions and stop when efficiency drops."],
    ["19) How should I handle conflicting community advice?", "Triangulate multiple sources and prefer method-backed testing over opinions."],
    ["20) Mid-game economy rule of thumb?", "Favor repeatable routes with stable returns over volatile high-risk spikes."],

    ["21) What should endgame optimization prioritize?", "Route efficiency, encounter consistency, and upgrade sequencing."],
    ["22) Is perfect-gear chasing worth it?", "Only after your baseline setup is already strong and stable."],
    ["23) How to decide if a build is endgame-ready?", "It handles target content consistently without relying on perfect execution every run."],
    ["24) Best way to prep for major patches?", "Keep flexible resources banked and avoid overcommitting to one fragile meta route."],
    ["25) How often should I re-evaluate my build?", "After each patch cycle or whenever performance plateaus."],
    ["26) Should I pivot builds often in endgame?", "Pivot deliberately, not reactively; frequent swaps usually kill progress."],
    ["27) What is the safest high-level progression philosophy?", "Consistency over spikes, systems over hype, and measured adaptation."],
    ["28) How to maintain long-term account/world health?", "Trim low-value loops regularly and reinvest into highest-return systems."],
    ["29) Most reliable advanced-player habit?", "Track your own results and iterate based on evidence, not trend chasing."],
    ["30) Core dependable advice?", "Build a stable engine first, then optimize aggressively with patch-aware decisions."]
  ],
  fo76: [
    ["1) Is Fallout 76 worth starting now?", "Yes, especially if you like co-op sandbox progression and seasonal live updates."],
    ["2) Best early leveling strategy?", "Quest progression + event participation + smart perk planning beats random grinding."],
    ["3) Is build planning important early?", "Yes. Early perk direction prevents costly mid-level inefficiency."],
    ["4) Should I rush main story?", "Progress it steadily for unlocks, but mix in events for resources and XP."],
    ["5) Best beginner weapon approach?", "Use ammo-efficient, reliable weapons before specializing heavily."],
    ["6) Is CAMP placement a big decision?", "Yes—resource access, travel convenience, and safety all matter."],
    ["7) How to avoid inventory pain?", "Scrap often, stash smart, and avoid hoarding low-value heavy items."],
    ["8) Is food/water management still important?", "Less punishing than launch era, but consumable management still improves uptime."],
    ["9) Best way to farm caps reliably?", "Run high-value events, do consistent vendor routes, and sell practical demand items (ammo/plans/utility gear) at sane prices."],
    ["10) Is joining teams worth it?", "Yes. Public teams give useful bonuses and smoother event completion."],
    ["11) Should I fear PVP?", "You can mostly avoid unwanted PVP with settings and situational awareness."],
    ["12) Best anti-ammo-starvation tip?", "Use weapons you can sustain and craft in bulk when materials are efficient."],
    ["13) How to prioritize SPECIAL/perks?", "Build around one primary damage archetype plus survival utility."],
    ["14) Is crafting central to long-term power?", "Yes, especially for gear maintenance and controlled progression."],
    ["15) Best event participation habit?", "Join high-value public events consistently for XP, loot, and plans."],
    ["16) Should I chase perfect legendary rolls early?", "No. Build functional baseline gear before perfection hunting."],
    ["17) Is mutation setup worth it?", "Yes later, once you can manage downsides and support perks properly."],
    ["18) How to reduce fast-travel cost pressure?", "Use strategic CAMP placement and free travel points effectively."],
    ["19) Best way to learn map economy?", "Track what actually sells in player vendors and adjust inventory focus."],
    ["20) Is solo viable in FO76?", "Yes, fully viable, though teams accelerate events and XP gain."],
    ["21) How to stop over-repairing/over-crafting?", "Craft to need, not fear; excessive stockpiling burns resources."],
    ["22) Best daily routine for progress?", "High-value events, key dailies, stash maintenance, then targeted goals."],
    ["23) Should I run one universal build?", "Use one strong primary build first; swap only when resources allow."],
    ["24) How important are resistance and survivability perks?", "Very—damage is useless if you can’t stay active in fights."],
    ["25) Best way to farm plans/recipes?", "Consistent event rotation and vendor checks beat random wandering."],
    ["26) Is power armor mandatory?", "No. Many strong non-PA builds exist; pick by playstyle preference."],
    ["27) How to avoid burnout in seasonal cycles?", "Set weekly objectives and skip low-value grinds."],
    ["28) Is player trading worth doing?", "Yes, if you learn pricing and sell practical demand items."],
    ["29) Most dependable new-player rule?", "Optimize for sustainability first, optimization second."],
    ["30) Core dependable advice?", "Run a coherent build, keep stash/resource discipline, and farm events on a repeatable weekly rhythm."]
  ],
  elden: [
    ["1) Best first priority in Elden Ring?", "Get survivability online first: Vigor investment, upgraded weapon, and flask upgrades before chasing high-risk bosses."],
    ["2) Most common beginner mistake?", "Spreading stats too thin too early and under-investing Vigor."],
    ["3) How important is Vigor really?", "Very. It’s the most reliable anti-one-shot stat through most of progression."],
    ["4) Should I follow a build guide immediately?", "Using a simple starter framework helps, but keep flexibility until your preferred playstyle is clear."],
    ["5) What matters more early: stats or weapon upgrades?", "Weapon upgrade level usually gives bigger immediate power spikes than minor stat points."],
    ["6) Is summoning spirit ashes valid?", "Absolutely. They are intended tools and can stabilize difficult encounters."],
    ["7) Should I clear every optional boss when found?", "No. If a fight feels overtuned for current gear, mark it and return later."],
    ["8) Best rune management habit?", "Spend runes before risky pushes and avoid carrying large losses into unknown zones."],
    ["9) How to explore efficiently?", "Map fragment first, nearby grace points second, then objective sweep."],
    ["10) Is shield play viable?", "Yes—guard counters and disciplined blocking are very strong in many matchups."],
    ["11) Is dodge-only play required?", "No. Mixing spacing, block, and dodge is often safer than dodge spam."],
    ["12) Best way to improve boss consistency?", "Learn 2–3 punish windows, keep stamina reserve, and avoid greed extensions."],
    ["13) Should I dual-wield early?", "Only if your stamina management and positioning are stable; it’s strong but punishable."],
    ["14) Is magic easier than melee?", "Magic can smooth many fights, but positioning and resource discipline still matter."],
    ["15) How to choose ashes of war?", "Pick one that matches your weapon scaling and combat rhythm, not just raw tooltip hype."],
    ["16) Is farming runes early worth it?", "Some farming is fine, but route knowledge + upgrades usually outperform long grind sessions."],
    ["17) How do I avoid build regret?", "Commit to one damage stat path early and delay niche side scaling until midgame."],
    ["18) Best way to handle status-heavy enemies?", "Use resistance prep, spacing discipline, and quicker kill windows over prolonged trades."],
    ["19) Is poise important?", "Yes for certain setups. It improves trade consistency, especially for aggressive melee plans."],
    ["20) Should I use heavy armor always?", "Only if you stay within comfortable equip load and mobility."],
    ["21) When should I respec?", "Respec when your core build identity changes, not for tiny optimization impulses."],
    ["22) How to prep for legacy dungeons?", "Bring upgraded weapon, enough flask balance, and status/utility options for mixed enemy packs."],
    ["23) Are consumables worth using?", "Yes. Buffs and utility items can swing difficult fights significantly."],
    ["24) Best anti-tilt strategy?", "Take short reset breaks and return with one specific adjustment plan."],
    ["25) Is co-op good for learning?", "Yes for momentum and confidence, but solo reps teach move recognition fastest."],
    ["26) How to evaluate talisman choices?", "Prioritize survival and build-enabling effects before niche damage boosts."],
    ["27) Should I chase meta weapons immediately?", "Only if they match your stat path; forced meta choices can slow progression."],
    ["28) Most dependable progression order?", "Explore, upgrade, return—don’t brute-force walls with underleveled tools."],
    ["29) Endgame prep checklist?", "High Vigor, refined flask setup, upgraded main/backup weapon, and practiced stamina discipline."],
    ["30) Core dependable advice?", "Build for consistency first, damage second; patience and preparation win the long game."]
  ]
};

function renderDynamicFaqs() {
  document.querySelectorAll('.dynamic-faq').forEach(container => {
    const key = container.dataset.game;
    const items = faqData[key] || [];

    const early = items.slice(0, 10);
    const mid = items.slice(10, 20);
    const end = items.slice(20, 30);

    const renderBlock = (title, arr) => `
      <div class="phase-block">
        <div class="phase-title">${title}</div>
        ${arr.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </div>
    `;

    container.innerHTML = [
      renderBlock('Early Game', early),
      renderBlock('Mid Game', mid),
      renderBlock('End Game', end)
    ].join('');
  });
}

renderDynamicFaqs();

// Maintainer note: every game should keep exactly 30 entries (10 early, 10 mid, 10 end)
// so stage blocks stay structurally consistent across tabs.

console.log('Night Vibes expanded game tabs loaded ✅');
