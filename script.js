// Night Vibes gagnvirkni
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
    selectorToggle.textContent = isOpen ? 'Leikjaval ▾' : 'Leikjaval ▸';
  };

  selectorToggle.addEventListener('click', toggleSelector);
  selectorToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelector();
    }
  });
}

const faqData = {
  nms: [
    ["1) Bestu first-spilalota priorities?", "Repair launch systems, unlock the Anomaly path, and buy 1-2 exosuit slots at each station/anomaly stop."],
    ["2) Fastest áreiðanleg snemma Units?", "Install scanner uppfærslur snemma and chain station missions that overlap with exploration you already plan to do."],
    ["3) Hvernig ætti ég að handle snemma birgðir pain?", "Keep active crafting inputs in regular slots, bulk mats in cargo, and sell low-value clutter every station visit."],
    ["4) Er a base mandatory right away?", "Build a compact utility base first (teleporter, refiner, storage, power), then expand only after leiðs are stable."],
    ["5) Bestu snemma multitool focus?", "Scanner income + mining-beam comfort first, then one consistent bardagi line."],
    ["6) Solo or multiplayer for week one?", "Solo is fully viable; add samspil only if it speeds your goals rather than distracting routing."],
    ["7) Hvernig avoid resource starvation?", "Never spend all core fuels at once; keep emergency launch fuel and life-support inputs before long trips."],
    ["8) Hvað story path unlocks key systems?", "Follow the snemma Artemis/Awakenings flow until anomaly and core utility systems are consistently available."],
    ["9) Ætti ég að chase rare ships immediately?", "Not yet. Stabilize income and slots first so ship hunts are efficient instead of disruptive."],
    ["10) Most dependable snemma rule?", "Progression over perfection: unlock systems first, optimize later."],

    ["11) Hvað defines healthy miðleik in NMS?", "Stable nanite loop, áreiðanleg unit income, and logistics that let you switch activities quickly."],
    ["12) Bestu miðleik money leiðs?", "Pick one primary loop (frigate expeditions, salvage loops, or crafted goods) and optimize it end-to-end."],
    ["13) Hvernig ætti ég að use freighters miðleik?", "Treat freighter as moving HQ: storage centralization, expedition uptime, and portable uppsetning utility."],
    ["14) Can I move bases cleanly?", "Yes—reuppsetning in the new location, transfer essential infrastructure, and preserve teleport links for old farms."],
    ["15) Hvernig keep uppfærslur uppfærsluplástur-proof?", "Prioritize universal value: slot count, logistics speed, lifun, and consistent income over gimmick loops."],
    ["16) Bestu way to manage Sentinels?", "Avoid prolonged escalation unless intentional; break line-of-sight and reset when objective is exploration or farming."],
    ["17) How many ships should I maintain?", "Keep role-based ships only if each has clear purpose; otherwise maintenance overhead slows framvinda."],
    ["18) Eru settlements a main framvinda engine?", "Usually side content value, not top-tier account acceleration."],
    ["19) Ætti ég að use coordinates/glyphs miðleik?", "Use them for targeted hunts or bottlenecks; free exploration remains best for discovery spilalotas."],
    ["20) Midgame anti-burnout habit?", "Rotate one hagkerfi loop, one exploration goal, and one uppsetning task per spilalota."],

    ["21) Endgame resource strategy?", "Automate extraction/refining where possible, then spend playtime on high-value goals, not manual grind."],
    ["22) Bestu long-term optimization priority?", "Route compression: fewer menu trips, fewer transfers, faster travel between recurring objectives."],
    ["23) Hvað should I min-max first?", "Main ship utility + exosuit slots + freighter logistics before cosmetic mega-projects."],
    ["24) Eru expeditions worth scheduling around?", "Yes for unique account rewards; verify dates through official channels and prioritize milestone efficiency."],
    ["25) Hvernig prep for major updates safely?", "Keep spare key auðlindir and avoid overcommitting to one brittle farm pipeline."],
    ["26) Bestu lokaleikur spilalota format?", "Start with maintenance (expeditions/storage), run one focused objective, finish with optional exploration."],
    ["27) Er permadeath worth trying?", "Great if you enjoy planning discipline; keep risk windows short and exits preplanned."],
    ["28) How to keep late game fun?", "Set themed projects (fleet, base, fauna, photo leiðs) instead of pure efficiency grind."],
    ["29) Reliable expert rule?", "Build systems that still work when your mood, uppfærsluplástur, or objective changes."],
    ["30) Kjarnaráð sem þú getur treyst?", "Use NMS as a logistics game first and a collection game second; framvinda becomes smoother and less fragile."]
  ],
  nioh: [
    ["1) Er this guidance safe if Nioh 3 details change?", "Yes—focus on proven Nioh fundamentals: Ki control, spacing, defensive discipline, and punish timing."],
    ["2) Stærstu snemma error?", "Spending all Ki on offense and getting caught in recovery with no defensive option."],
    ["3) Hvað should I train first?", "Guard timing, Ki pulse rhythm, and one áreiðanleg combo leið per stance."],
    ["4) Should byrjandis lock one weapon?", "Main one weapon first, carry a secondary for matchup coverage, and avoid constant swapping."],
    ["5) Light or heavy loadout snemma?", "Choose the load that preserves movement and Ki comfort; control beats raw armor greed."],
    ["6) Eru magic/ninjutsu tools optional?", "Optional but high-value; even light utility investment improves stöðugleiki and recovery windows."],
    ["7) Hvernig ætti ég að spend snemma stats?", "Meet requirements, stabilize lifun/Ki, then scale damage after baseline comfort is stable."],
    ["8) Bestu way to learn bosses?", "Run short attempts focused on identifying 2-3 safe punish windows and retreat patterns."],
    ["9) Dodge only or block too?", "Use both. Mixed defense is safer than committing to one answer for every pattern."],
    ["10) Kjarnaregla snemma í leiknum?", "Never enter a dangerous exchange without enough Ki to defend afterward."],

    ["11) Midgame framvinda focus?", "Refine stöðugleiki: cleaner stance transitions, fewer greedy strings, better utility timing."],
    ["12) Ætti ég að hard-optimize gear miðleik?", "Target high-impact uppfærslur first; full min-max can wait until uppsetning identity is fixed."],
    ["13) How important are set bonuses miðleik?", "Helpful, but only if they support your actual bardagi rhythm and lifun."],
    ["14) Soul matching now or later?", "Use selectively; avoid heavy resource burn on gear you’ll replace soon."],
    ["15) Hvernig handle repeated deaths?", "Lower complexity: shorten combos, simplify tools, and re-establish safe defensive habits."],
    ["16) Er samspil good for learning?", "Great for smoothing framvinda, but still practice einspili reps to learn enemy telegraphs cleanly."],
    ["17) Bestu loot management habit?", "Dismantle/cull aggressively with clear rules so birgðir never blocks spilalota momentum."],
    ["18) Eru status uppsetnings áreiðanleg?", "Yes when they support uptime and safety, not when they force risky overextensions."],
    ["19) Midgame skill-tree priority?", "Core passives, Ki hagkerfi, and repeatable bread-and-butter options before niche tech."],
    ["20) Midgame efficiency benchmark?", "Fewer avoidable hits, faster resets, and consistent clears under pressure."],

    ["21) Hvenær to start full min-max?", "After campaign stability, when gear turnover slows and your playstyle is locked in."],
    ["22) Endgame uppsetning philosophy?", "Optimize for reliability first, then stack damage once defense and Ki flow are solved."],
    ["23) How often should I pivot uppsetnings?", "Deliberately and rarely; frequent pivots usually erase mastery gains."],
    ["24) Hvað separates strong players late game?", "Decision quality under pressure: when to disengage, reset Ki, and re-enter safely."],
    ["25) Er ranged utility still relevant lokaleikur?", "Yes—for controlled pulls, tempo resets, and safer multi-target handling."],
    ["26) Bestu pre-boss checklist?", "Load/agility check, healing stock, shortcut readiness, utility setup, and first-phase plan."],
    ["27) How to uppfærsluplástur-proof your setup?", "Keep one flexible slot in gear/tooling so balance changes don’t invalidate the whole uppsetning."],
    ["28) Bestu anti-tilt routine?", "After two sloppy runs, pause, review one mistake category, and return with a single correction target."],
    ["29) Reliable long-term framvinda order?", "Ki stability -> defense stöðugleiki -> punish uptime -> damage optimization."],
    ["30) Kjarnaráð sem þú getur treyst?", "Master tempo control first; everything else in Nioh-style bardagi scales from that."]
  ],
  hytale: [
    ["1) Bestu first-week focus?", "Set up one stable framvinda loop first: áreiðanleg gear uppfærslur, movement comfort, and resource flow."],
    ["2) Stærstu snemma mistake players make?", "Trying to optimize everything at once instead of mastering one complete loop."],
    ["3) Ætti ég að prioritize bardagi or uppsetninging first?", "Prioritize whichever unlocks your bottleneck, but keep both progressing so account/world growth stays balanced."],
    ["4) Hvernig avoid wasting snemma auðlindir?", "Spend on uppfærslur that improve stöðugleiki (lifun, mobility, core tools), not flashy side systems."],
    ["5) Er einspili framvinda viable?", "Yes, but samspil can accelerate farming and difficult content if coordination is good."],
    ["6) Bestu way to choose a uppsetning path?", "Pick one playstyle that feels natural, then commit long enough to learn its breakpoints."],
    ["7) How many systems should I grind at once?", "One main system plus one support system is usually optimal snemma."],
    ["8) Hvernig evaluate if a guide is good?", "Check uppfærsluplástur/version date, test scope, and whether tradeoffs are explained clsnemma."],
    ["9) Most dependable framvinda principle?", "Consistency beats spikes: steady uppfærslur outperform risky high-roll gambles."],
    ["10) Ætti ég að chase snemma meta leiðs blindly?", "No. Verify they still work on current uppfærsluplástur and match your playstyle."],
    ["11) How to reduce downtime in spilalotas?", "Batch objectives: gather, craft, and complete nearby goals in one leið."],
    ["12) Er birgðir discipline important?", "Yes. Clean birgðir flow prevents wasted time and accidental resource starvation."],
    ["13) Bestu habit for lifun?", "Always keep fallback tools ready and avoid entering new zones underprepared."],
    ["14) Hvernig recover from framvinda stalls?", "Identify the single biggest blocker and solve that before broad grinding."],
    ["15) Ætti ég að specialize snemma or stay flexible?", "Specialize enough to gain momentum, but keep a flexible backup option."],
    ["16) Er movement optimization worth practicing?", "Yes. Better movement raises both survival and farming efficiency."],
    ["17) Hvernig avoid burnout?", "Set short milestones, rotate activities, and stop before efficiency collapses."],
    ["18) Bestu way to handle difficult encounters?", "Learn patterns in short reps, then return with one targeted adjustment."],
    ["19) Ætti ég að hoard all materials?", "No. Hoard key bottleneck materials, spend the rest to maintain momentum."],
    ["20) Hvað is a áreiðanleg upgrade priority order?", "Survivability -> core damage/utility -> quality-of-life uppfærslur."],
    ["21) Er samspil always faster?", "Only when roles are clear; disorganized samspil can be slower than einspili efficiency."],
    ["22) How to keep uppsetnings from feeling weak miðleik?", "Recheck scaling path, upgrade breakpoints, and synergy gaps before rerolling."],
    ["23) Ætti ég að reset often when experimenting?", "Experiment in controlled windows; constant resets destroy long-term momentum."],
    ["24) Bestu way to prep for new uppfærsluplástur changes?", "Keep flexible auðlindir banked and avoid overcommitting to one fragile leið."],
    ["25) How to judge whether content is worth farming?", "Measure reward per time and whether it solves current framvinda needs."],
    ["26) Er optimization worth it for casual players?", "Light optimization gives big gains without turning the game into spreadsheet work."],
    ["27) Hvað should lengra kominn players optimize first?", "Route efficiency, upgrade sequencing, and low-risk high-value repeatables."],
    ["28) Hvernig know when to pivot strategy?", "Pivot when your current loop stops giving meaningful gains per spilalota."],
    ["29) Most dependable long-term habit?", "Review your framvinda plan every few spilalotas and trim low-value activities."],
    ["30) Kjarnaráð sem þú getur treyst?", "Play with intention: stable loops, clear priorities, and uppfærsluplástur-aware adjustments win long-term."]
  ],
  valheim: [
    ["1) Bestu first-day priority?", "Secure shelter, basic food variety, and a safe spawn-adjacent workbench loop before long exploration."],
    ["2) Most common new-player mistake?", "Rushing bosses without proper food tiers, rested buff uptime, and a backup recovery kit."],
    ["3) Er rested buff really that important?", "Yes. It massively improves stamina/health recovery and should be maintained almost constantly."],
    ["4) Bestu snemma weapons?", "Use what you can sustain reliably; spear/bow/club combinations are practical snemma depending on comfort."],
    ["5) Ætti ég að uppsetning main base snemma?", "Build a modest functional base first, then expand after resource leiðs are mapped."],
    ["6) How important is food framvinda?", "Critical. Better food is one of the largest lifun and framvinda multipliers."],
    ["7) Er farming worth doing snemma?", "Yes once unlocked—consistent food supply removes major framvinda friction."],
    ["8) Solo or samspil easier?", "Co-op smooths bardagi and hauling, but einspili is fully viable with good prep discipline."],
    ["9) Bestu way to reduce corpse-run pain?", "Carry portal mats, maintain backup gear, and never overextend without exit leiðs."],
    ["10) Ætti ég að overuppsetning defenses snemma?", "Basic perimeter and awareness usually beat expensive over-fortification too snemma."],
    ["11) Er bow mandatory?", "Not mandatory, but ranged control is extremely valuable in many encounters."],
    ["12) How to approach each new biome?", "Scout edges first, test enemies, and upgrade gear before deep commits."],
    ["13) Bestu stamina management habit?", "Never empty stamina bar completely; reserve enough for defense and retreat."],
    ["14) Er parry timing worth learning?", "Yes, parry stöðugleiki can dramatically improve bardagi safety and efficiency."],
    ["15) Bestu transport strategy mid-game?", "Build leið infrastructure (roads/ports/portals) to cut repeat travel costs."],
    ["16) Ætti ég að hoard everything?", "No. Keep organized core materials and convert surplus into uppsetning/framvinda value."],
    ["17) Eru portals overpowered?", "They’re intended logistics tools; using them smartly reduces grind fatigue."],
    ["18) Bestu anti-frustration tip?", "Split risky trips into short objectives with áreiðanleg return plans."],
    ["19) How to prep for boss attempts?", "Food tier, resist prep, repair check, and a clean arena matter more than bravado."],
    ["20) Can I skip base aesthetics?", "Yes snemma. Function-first base design accelerates framvinda."],
    ["21) Bestu way to train bardagi confidence?", "Practice enemy patterns in controlled fights near safe fallback zones."],
    ["22) Er shield usage worth it?", "Yes, especially while learning timings and threat spacing."],
    ["23) How to keep samspil groups efficient?", "Assign roles: scout, uppsetninger, farmer, logistics, and rotate when bored."],
    ["24) Hvað to upgrade first usually?", "Tools + lifun + mobility uppfærslur before cosmetic expansion."],
    ["25) Ætti ég að chase leiðbeiningar for everything?", "Use leiðbeiningar for bottlenecks, but leave room for discovery so framvinda stays fun."],
    ["26) How to reduce grind feeling?", "Batch gather runs, optimize leiðs, and avoid single-resource tunnel vision."],
    ["27) Er base location choice huge?", "Yes. Access to mixed biomes/leiðs saves massive long-term time."],
    ["28) Most dependable late-game habit?", "Always prep redundancies: spare gear, food reserves, and leið backups."],
    ["29) Er death penalty manageable?", "Yes, with planning. It’s harsh but fair once logistics discipline is built."],
    ["30) One meta truth for Valheim?", "Preparation beats reflexes more often than not."]
  ],
  endfield: [
    ["1) Hvað should I prioritize in my first week?", "Build one stable core squad first, unlock essential systems, then branch into specialized teams."],
    ["2) Stærstu framvinda mistake new players make?", "Spreading auðlindir across too many units snemma and delaying core-team power spikes."],
    ["3) How many units should I seriously invest in snemma?", "Usually one main team plus 1–2 flex units for mechanics coverage."],
    ["4) Ætti ég að chase every new banner?", "No. Pull around role gaps and long-term account plan, not hype cycles."],
    ["5) Hvað matters more: rarity or team fit?", "Team fit and role synergy usually outperform raw rarity."],
    ["6) Bestu way to spend stamina efficiently?", "Prioritize account-unlock materials and guaranteed framvinda auðlindir before luxury farming."],
    ["7) Er daily stöðugleiki really better than long spilalotas?", "Yes. Reliable daily framvinda compounds harder than occasional marathon play."],
    ["8) Ætti ég að rush story or side systems first?", "Push story until key systems unlock, then balance framvinda and resource farming."],
    ["9) Bestu way to avoid account stagnation?", "Audit bottlenecks weekly: damage check, sustain check, and upgrade material shortages."],
    ["10) Hvernig choose who to level next?", "Pick units that solve current blockers, not units that only increase ceiling."],
    ["11) Er auto-battle enough for framvinda?", "Use auto for repetition, but learn difficult mechanics manually to avoid bad habits."],
    ["12) Hvenær should I start optimizing gear/relics?", "After your core team can clear routine content reliably."],
    ["13) Should F2P players copy spender strategies?", "No. Resource pacing and pull discipline are more important for F2P stability."],
    ["14) Hvernig avoid wasting premium currency?", "Set pull budgets in advance and stick to them even during hype banners."],
    ["15) Hvað is a dependable team-uppsetninging rule?", "Cover essential roles first: sustained damage, lifun, utility/control."],
    ["16) Hvernig handle difficulty spikes?", "Fix role gaps and upgrade breakpoints before brute-force retries."],
    ["17) Er rerolling worth it long-term?", "Only if done snemma with a clear target; otherwise lost framvinda usually costs more."],
    ["18) Ætti ég að hoard all auðlindir forever?", "No. Hoard selectively, but spend enough to keep momentum and unlock content."],
    ["19) Hvernig evaluate if a unit is truly good?", "Look at role compression, stöðugleiki, and upgrade cost efficiency in real content."],
    ["20) Bestu way to farm event shops?", "Prioritize highest-value limited auðlindir first, then fill with general framvinda items."],
    ["21) How many teams do I need for lokaleikur-style content?", "Develop one excellent team first, then a second specialized roster."],
    ["22) Er min-maxing snemma account stats worth it?", "Only after your baseline framvinda loop is stable and repeatable."],
    ["23) Hvað should I do when community advice conflicts?", "Prefer advice with uppfærsluplástur/date stamps and clear testing methodology."],
    ["24) Hvernig avoid burnout?", "Set weekly milestones, stop after high-value tasks, and skip low-impact grind."],
    ["25) Ætti ég að invest in niche units snemma?", "Usually no—uppsetning broad reliability before niche optimization."],
    ["26) Hvað is the safest long-term framvinda philosophy?", "Consistency over spikes: steady uppfærslur beat feast-or-famine resource dumps."],
    ["27) How often should I review my account plan?", "After each major uppfærsluplástur/event cycle or when framvinda stalls."],
    ["28) Bestu way to prep for new content uppfærsluplástures?", "Bank core upgrade materials and keep one flexible slot in your investment plan."],
    ["29) Hvað is the highest-value habit for account strength?", "Never let stamina and daily core tasks go to waste."],
    ["30) Kjarnaráð sem þú getur treyst?", "Build a stable foundation, spend with intention, and adapt quickly to uppfærsluplástur changes."]
  ],
  poe2: [
    ["1) Er Path of Exile 2 byrjandi-friendly?", "It is deep and demanding; byrjandi success comes from following a coherent uppsetning plan snemma."],
    ["2) Stærstu snemma mistake?", "Improvising passive trees without a plan, then hitting scaling walls."],
    ["3) Ætti ég að use a uppsetning guide?", "Yes for first character—then branch out once you understand itemization and defenses."],
    ["4) Er offense enough to carry framvinda?", "No. Layered defenses + recovery + uptime matter as much as DPS for stable framvinda."],
    ["5) Bestu first-character mindset?", "Prioritize stöðugleiki and lifun over flashy but fragile damage paths."],
    ["6) Er currency spending snemma dangerous?", "Yes. Save high-value currency until upgrade value is clear."],
    ["7) How important are resistances?", "Critical. Keep resist and core defenses healthy through every framvinda phase."],
    ["8) Ætti ég að craft snemma or buy uppfærslur?", "Use low-risk crafting for basics; buy key uppfærslur when value is obvious."],
    ["9) Fastest way to improve uppsetning quality?", "Identify weakest slot and biggest defensive gap first, then uppfærsluplástur systematically."],
    ["10) Er movement skill priority high?", "Yes—mobility and repositioning greatly improve survival and clear speed."],
    ["11) How to avoid stash chaos?", "Sort by function: crafting base items, sellable rares, currency, and uppsetning-critical gear."],
    ["12) Ætti ég að copy lokaleikur uppsetnings too snemma?", "No, many require expensive breakpoints and feel bad before completion."],
    ["13) Bestu way to learn boss fights?", "Short focused reps: learn telegraphs and safe windows instead of brute forcing."],
    ["14) How to evaluate item uppfærslur quickly?", "Check whether upgrade solves current bottleneck (damage uptime, defense gap, sustain)."],
    ["15) Er group play always better for progress?", "Not always. Coordination quality matters more than party size."],
    ["16) Hvað kills most new players in ARPG lokaleikur?", "Ignoring layered defense and relying on damage-only logic."],
    ["17) Ætti ég að reroll often?", "Only when uppsetning is structurally broken; frequent rerolls slow mastery."],
    ["18) Er trade mandatory?", "Depends on goals, but trade usually accelerates framvinda significantly."],
    ["19) How to pick farming strategy?", "Choose content your uppsetning handles safely and repeatedly, then scale efficiency."],
    ["20) Bestu anti-burnout approach?", "Set short economic goals and rotate activities instead of endless one-loop grinding."],
    ["21) Eru tier lists enough for decisions?", "No. Build comfort and budget constraints matter as much as tier rank."],
    ["22) Ætti ég að chase perfect items snemma?", "No. Incremental uppfærslur outperform perfection chasing for most players."],
    ["23) How to keep deaths from snowballing?", "Pause, identify failure source, and fix one defensive weakness at a time."],
    ["24) Er flask/micro-management worth it?", "Yes, good utility management is a major performance multiplier."],
    ["25) Most dependable currency rule?", "Spend where it unlocks framvinda, not where it looks flashy."],
    ["26) How to know when uppsetning is map-ready?", "Stable clear speed, survivable boss attempts, and no frequent one-shots."],
    ["27) Bestu snemma market behavior?", "Sell useful mid-tier items quickly and avoid overholding speculative birgðir."],
    ["28) Ætti ég að force meta if I dislike playstyle?", "Usually no—stöðugleiki drops when the uppsetning doesn’t fit your rhythm."],
    ["29) Reliable framvinda priority order?", "Defenses -> sustain -> damage scaling -> quality-of-life."] ,
    ["30) Kjarnaráð sem þú getur treyst?", "Run a coherent plan, uppfærsluplástur weaknesses snemma, and upgrade deliberately."]
  ],
  kcd2: [
    ["1) Er KCD2 bardagi skill-based?", "Yes. Timing, spacing, stamina control, and preparation matter far more than rushing."],
    ["2) Bestu opening habit?", "Treat snemma hours as a training phase: stabilize money, food, gear condition, and bardagi fundamentals before ambition spikes."],
    ["3) Er gear enough to win hard fights?", "No. Skill framvinda and fight selection matter heavily."],
    ["4) Ætti ég að pick every fight?", "No. Avoid bad odds, pick cleaner engagements, and use terrain advantage."],
    ["5) Er stamina management crucial?", "Absolutely—empty stamina often means immediate punishment."],
    ["6) Bestu way to make money snemma?", "Reliable legal loops and quest rewards beat risky crime spirals snemma on."],
    ["7) How to train bardagi efficiently?", "Short focused spar spilalotas and controlled encounters uppsetning stöðugleiki."],
    ["8) Ætti ég að neglect speech/utility skills?", "No. Non-bardagi options save time, money, and risk."],
    ["9) Er stealth viable?", "Yes, when approached patiently with visibility/noise discipline."],
    ["10) Bestu birgðir discipline rule?", "Carry what supports your current objective; avoid over-encumbrance penalties."],
    ["11) How to prep before dangerous quests?", "Repair gear, stock healing/food, and save with a clear fallback leið."],
    ["12) Er horse management important?", "Yes, mobility and storage quality significantly affect world efficiency."],
    ["13) Ætti ég að rush main story?", "Pacing side framvinda often produces smoother main-story difficulty."],
    ["14) How to reduce frustration in duels?", "Focus on defense windows and clean counter timing before aggression."],
    ["15) Er reputation impactful?", "Usually yes—social consequences influence options and outcomes."],
    ["16) Bestu anti-death spiral strategy?", "Reset tempo, avoid tilt-fights, and return with better prep."],
    ["17) Er lockpicking/theft worth learning?", "Useful, but keep legal consequences and roleplay goals in mind."],
    ["18) Ætti ég að min-max instantly?", "No. Learn systems first, optimize later."],
    ["19) Bestu way to learn map leiðs?", "Use repeated short loops between high-value hubs before long trips."],
    ["20) Er heavy armor always better?", "Not always—mobility and stamina costs can outweigh raw protection."],
    ["21) How to handle multiple enemies?", "Disengage, funnel space, and avoid open surround situations."],
    ["22) Er bow use worth practicing?", "Yes, ranged control can simplify difficult engagements."],
    ["23) Most dependable social strategy?", "Invest in speech options and read quest context before committing."],
    ["24) How to manage saves smartly?", "Use regular framvinda checkpoints and avoid huge unsaved risk chains."],
    ["25) Bestu way to keep roleplay + efficiency?", "Set character rules, then optimize within those boundaries."],
    ["26) Ætti ég að grind one skill only?", "Balanced development usually gives better overall mission flexibility."],
    ["27) How to recover bad reputation?", "Use consistent lawful behavior, complete helpful tasks, and avoid repeat offenses."],
    ["28) Er night gameplay safer?", "Situational—better for stealth, riskier for visibility/navigation."],
    ["29) Most áreiðanleg framvinda priority?", "Survivability, stable income, travel efficiency, then luxury uppfærslur."],
    ["30) Kjarnaráð sem þú getur treyst?", "Play patient, prepare well, and respect the simulation."]
  ],
  wwm: [
    ["1) Bestu first-week priority?", "Build a stable core loop: one áreiðanleg bardagi setup, one income/material leið, and one mobility leið."],
    ["2) Stærstu snemma mistake?", "Spreading uppfærslur across too many systems before a core uppsetning is functional."],
    ["3) Ætti ég að min-max immediately?", "No. Early stöðugleiki and lifun beat fragile high-risk optimization."],
    ["4) Hvernig choose a uppsetning path?", "Pick one playstyle that feels natural, then commit long enough to hit key power breakpoints."],
    ["5) Hvað should I upgrade first?", "Prioritize lifun, core damage uptime, and movement/control tools before niche uppfærslur."],
    ["6) Er exploration-first viable?", "Yes, if you pair it with practical framvinda goals so exploration feeds uppfærslur."],
    ["7) Bestu way to avoid resource waste?", "Spend on uppfærslur that solve current bottlenecks, not on speculative future uppsetnings."],
    ["8) Ætti ég að use leiðbeiningar right away?", "Use them for bottlenecks only; avoid copying full leiðs blindly without uppfærsluplástur/version checks."],
    ["9) How to evaluate whether a guide is áreiðanleg?", "Prefer leiðbeiningar with uppfærsluplástur-date tags, test conditions, and explicit tradeoffs."],
    ["10) Most dependable snemma-game rule?", "One strong uppsetning online first; everything else is secondary."],

    ["11) Hvað defines good mid-game framvinda?", "Consistent clear speed, low death rate, and repeatable resource gains per spilalota."],
    ["12) How many uppsetnings should I run mid-game?", "One primary uppsetning plus one flexible backup is usually optimal."],
    ["13) Bestu way to break framvinda plateaus?", "Identify the single biggest blocker (damage, defense, or sustain) and fix that first."],
    ["14) Er samspil always more efficient?", "Only with clear role coordination; disorganized samspil often wastes time."],
    ["15) Ætti ég að hoard all materials?", "No. Hoard bottleneck auðlindir; spend the rest to keep momentum."],
    ["16) How to improve fight stöðugleiki?", "Learn enemy patterns in short reps and reduce greedy punish attempts."],
    ["17) Er gear optimization worth doing mid-game?", "Yes, but focus on high-impact slots first instead of full-set perfection."],
    ["18) Bestu anti-burnout strategy?", "Run short objective-based spilalotas and stop when efficiency drops."],
    ["19) Hvernig ætti ég að handle conflicting community advice?", "Triangulate multiple sources and prefer method-backed testing over opinions."],
    ["20) Mid-game hagkerfi rule of thumb?", "Favor repeatable leiðs with stable returns over volatile high-risk spikes."],

    ["21) Hvað should lokaleikur optimization prioritize?", "Route efficiency, encounter stöðugleiki, and upgrade sequencing."],
    ["22) Er perfect-gear chasing worth it?", "Only after your baseline setup is already strong and stable."],
    ["23) How to decide if a uppsetning is lokaleikur-ready?", "It handles target content consistently without relying on perfect execution every run."],
    ["24) Bestu way to prep for major uppfærsluplástures?", "Keep flexible auðlindir banked and avoid overcommitting to one fragile meta leið."],
    ["25) How often should I re-evaluate my uppsetning?", "After each uppfærsluplástur cycle or whenever performance plateaus."],
    ["26) Ætti ég að pivot uppsetnings often in lokaleikur?", "Pivot deliberately, not reactively; frequent swaps usually kill progress."],
    ["27) Hvað is the safest high-level framvinda philosophy?", "Consistency over spikes, systems over hype, and measured adaptation."],
    ["28) How to maintain long-term account/world health?", "Trim low-value loops regularly and reinvest into highest-return systems."],
    ["29) Most áreiðanleg lengra kominn-player habit?", "Track your own results and iterate based on evidence, not trend chasing."],
    ["30) Kjarnaráð sem þú getur treyst?", "Build a stable engine first, then optimize aggressively with uppfærsluplástur-aware decisions."]
  ],
  fo76: [
    ["1) Er Fallout 76 worth starting now?", "Yes, especially if you like samspil sandbox framvinda and seasonal live updates."],
    ["2) Bestu snemma leveling strategy?", "Quest framvinda + event participation + smart perk planning beats random grinding."],
    ["3) Er uppsetning planning important snemma?", "Yes. Early perk direction prevents costly mid-level inefficiency."],
    ["4) Ætti ég að rush main story?", "Progress it steadily for unlocks, but mix in events for auðlindir and XP."],
    ["5) Bestu byrjandi weapon approach?", "Use ammo-efficient, áreiðanleg weapons before specializing heavily."],
    ["6) Er CAMP placement a big decision?", "Yes—resource access, travel convenience, and safety all matter."],
    ["7) How to avoid birgðir pain?", "Scrap often, stash smart, and avoid hoarding low-value heavy items."],
    ["8) Er food/water management still important?", "Less punishing than launch era, but consumable management still improves uptime."],
    ["9) Bestu way to farm caps reliably?", "Run high-value events, do consistent vendor leiðs, and sell practical demand items (ammo/plans/utility gear) at sane prices."],
    ["10) Er joining teams worth it?", "Yes. Public teams give useful bonuses and smoother event completion."],
    ["11) Ætti ég að fear PVP?", "You can mostly avoid unwanted PVP with settings and situational awareness."],
    ["12) Bestu anti-ammo-starvation tip?", "Use weapons you can sustain and craft in bulk when materials are efficient."],
    ["13) How to prioritize SPECIAL/perks?", "Build around one primary damage archetype plus survival utility."],
    ["14) Er crafting central to long-term power?", "Yes, especially for gear maintenance and controlled framvinda."],
    ["15) Bestu event participation habit?", "Join high-value public events consistently for XP, loot, and plans."],
    ["16) Ætti ég að chase perfect legendary rolls snemma?", "No. Build functional baseline gear before perfection hunting."],
    ["17) Er mutation setup worth it?", "Yes later, once you can manage downsides and support perks properly."],
    ["18) How to reduce fast-travel cost pressure?", "Use strategic CAMP placement and free travel points effectively."],
    ["19) Bestu way to learn map hagkerfi?", "Track what actually sells in player vendors and adjust birgðir focus."],
    ["20) Er einspili viable in FO76?", "Yes, fully viable, though teams accelerate events and XP gain."],
    ["21) How to stop over-repairing/over-crafting?", "Craft to need, not fear; excessive stockpiling burns auðlindir."],
    ["22) Bestu daily routine for progress?", "High-value events, key dailies, stash maintenance, then targeted goals."],
    ["23) Ætti ég að run one universal uppsetning?", "Use one strong primary uppsetning first; swap only when auðlindir allow."],
    ["24) How important are resistance and lifun perks?", "Very—damage is useless if you can’t stay active in fights."],
    ["25) Bestu way to farm plans/recipes?", "Consistent event rotation and vendor checks beat random wandering."],
    ["26) Er power armor mandatory?", "No. Many strong non-PA uppsetnings exist; pick by playstyle preference."],
    ["27) How to avoid burnout in seasonal cycles?", "Set weekly objectives and skip low-value grinds."],
    ["28) Er player trading worth doing?", "Yes, if you learn pricing and sell practical demand items."],
    ["29) Most dependable new-player rule?", "Optimize for sustainability first, optimization second."],
    ["30) Kjarnaráð sem þú getur treyst?", "Run a coherent uppsetning, keep stash/resource discipline, and farm events on a repeatable weekly rhythm."]
  ],
  elden: [
    ["1) Bestu first priority in Elden Ring?", "Get lifun online first: Vigor investment, upgraded weapon, and flask uppfærslur before chasing high-risk bosses."],
    ["2) Most common byrjandi mistake?", "Spreading stats too thin too snemma and under-investing Vigor."],
    ["3) How important is Vigor really?", "Very. It’s the most áreiðanleg anti-one-shot stat through most of framvinda."],
    ["4) Ætti ég að follow a uppsetning guide immediately?", "Using a simple starter framework helps, but keep flexibility until your preferred playstyle is clear."],
    ["5) Hvað matters more snemma: stats or weapon uppfærslur?", "Weapon upgrade level usually gives bigger immediate power spikes than minor stat points."],
    ["6) Er summoning spirit ashes valid?", "Absolutely. They are intended tools and can stabilize difficult encounters."],
    ["7) Ætti ég að clear every optional boss when found?", "No. If a fight feels overtuned for current gear, mark it and return later."],
    ["8) Bestu rune management habit?", "Spend runes before risky pushes and avoid carrying large losses into unknown zones."],
    ["9) How to explore efficiently?", "Map fragment first, nearby grace points second, then objective sweep."],
    ["10) Er shield play viable?", "Yes—guard counters and disciplined blocking are very strong in many matchups."],
    ["11) Er dodge-only play required?", "No. Mixing spacing, block, and dodge is often safer than dodge spam."],
    ["12) Bestu way to improve boss stöðugleiki?", "Learn 2–3 punish windows, keep stamina reserve, and avoid greed extensions."],
    ["13) Ætti ég að dual-wield snemma?", "Only if your stamina management and positioning are stable; it’s strong but punishable."],
    ["14) Er magic easier than melee?", "Magic can smooth many fights, but positioning and resource discipline still matter."],
    ["15) How to choose ashes of war?", "Pick one that matches your weapon scaling and bardagi rhythm, not just raw tooltip hype."],
    ["16) Er farming runes snemma worth it?", "Some farming is fine, but leið knowledge + uppfærslur usually outperform long grind spilalotas."],
    ["17) Hvernig avoid uppsetning regret?", "Commit to one damage stat path snemma and delay niche side scaling until miðleik."],
    ["18) Bestu way to handle status-heavy enemies?", "Use resistance prep, spacing discipline, and quicker kill windows over prolonged trades."],
    ["19) Er poise important?", "Yes for certain setups. It improves trade stöðugleiki, especially for aggressive melee plans."],
    ["20) Ætti ég að use heavy armor always?", "Only if you stay within comfortable equip load and mobility."],
    ["21) Hvenær should I respec?", "Respec when your core uppsetning identity changes, not for tiny optimization impulses."],
    ["22) How to prep for legacy dungeons?", "Bring upgraded weapon, enough flask balance, and status/utility options for mixed enemy packs."],
    ["23) Eru consumables worth using?", "Yes. Buffs and utility items can swing difficult fights significantly."],
    ["24) Bestu anti-tilt strategy?", "Take short reset breaks and return with one specific adjustment plan."],
    ["25) Er samspil good for learning?", "Yes for momentum and confidence, but einspili reps teach move recognition fastest."],
    ["26) How to evaluate talisman choices?", "Prioritize survival and uppsetning-enabling effects before niche damage boosts."],
    ["27) Ætti ég að chase meta weapons immediately?", "Only if they match your stat path; forced meta choices can slow framvinda."],
    ["28) Most dependable framvinda order?", "Explore, upgrade, return—don’t brute-force walls with underleveled tools."],
    ["29) Endgame prep checklist?", "High Vigor, refined flask setup, upgraded main/backup weapon, and practiced stamina discipline."],
    ["30) Kjarnaráð sem þú getur treyst?", "Build for stöðugleiki first, damage second; patience and preparation win the long game."]
  ]
};

function renderDynamicFaqs() {
  document.querySelectorAll('.dynamic-faq').forEach(container => {
    const key = container.dataset.game;
    const items = faqData[key] || [];

    const snemma = items.slice(0, 10);
    const mid = items.slice(10, 20);
    const end = items.slice(20, 30);

    const renderBlock = (title, arr) => `
      <div class="phase-block">
        <div class="phase-title">${title}</div>
        ${arr.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </div>
    `;

    container.innerHTML = [
      renderBlock('Byrjun', snemma),
      renderBlock('Miðleikur', mid),
      renderBlock('Lokaleikur', end)
    ].join('');
  });
}

renderDynamicFaqs();

// Athugasemd viðhaldsaðila: every game should keep exactly 30 entries (10 snemma, 10 mid, 10 end)
// svo stigablokkir haldist byggingarlega samræmdar milli flipa.

console.log('Night Vibes expanded game tabs hlaðið inn ✅');
