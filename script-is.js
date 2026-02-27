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
  nms: "Nei Man's Sky",
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
    ["1) Bestu forgangsatriði í fyrstu spilalotu?", "Gerðu við skotkerfi, opnaðu leiðina að Anomaly og keyptu 1-2 exosuit-birgðaraufar á hverri stöð/Anomaly viðkomu."],
    ["2) Fljótlegasta áreiðanlega leiðin að Units snemma?", "Settu upp skannauppfærslur snemma og raðaðu stöðvarverkefnum sem falla að könnun sem þú ætlar hvort eð er að gera."],
    ["3) Hvernig ætti ég að takast á við birgðavesen snemma?", "Hafðu virkt smíðaefni í venjulegum raufum, magn-efni í farmi og seldu lágverðmætan óþarfa í hverri stöðvarheimsókn."],
    ["4) Er nauðsynlegt að byggja bækistöð strax?", "Byggðu fyrst litla nytjastöð (fjarflutning, hreinsari, geymsla, rafmagn) og stækkaðu svo aðeins þegar leiðirnar eru eðaðnar stöðugar."],
    ["5) Hvert er besta fókusinn á multitool snemma?", "Skannatekjur og þægilegur mining-beam fyrst, síðan ein stöðug bardagalína."],
    ["6) Einspilun eða fjölspilun fyrstu vikuna?", "Einspilun er fullkomlega raunhæf; bættu samspili við aðeins ef það flýtir markmiðum í stað þess að trufla skipulagið."],
    ["7) Hvernig fyrirðast ég auðlindaskort?", "Ekki eyða öllu kjarneldsneyti í einu; hafðu alltaf neyðareldsneyti fyrir flugtak og lífsstuðning fyrir langar ferðir."],
    ["8) Hvaða söguleið opnar lykilkerfi?", "Fylgdu snemma Artemis/Awakenings framvindunni þar til Anomaly og kjarnakerfi eru ávallt aðgengileg."],
    ["9) Ætti ég að elta sjaldgæf skip strax?", "Ekki strax. Stöðgaðu tekjur og raufar fyrst svo skipaleit verði skilvirk í stað þess að trufla framvindu."],
    ["10) Áreiðanlegasta reglan snemma?", "Framvinda fram yfir fullkomnun: opnaðu kerfi fyrst, fínstilltu síðar."],

    ["11) Hvað skilgreinir heilbrigðan miðleik í NMS?", "Stable nanite hringur, áreiðanleg unit income, og logistics that let you switch activities quickly."],
    ["12) Bestu peningaleiðir í miðleik?", "Pick one primary hringur (frigate expeditions, salvage loops, eða crafted goods) og fínstilla it end-to-end."],
    ["13) Hvernig ætti ég að nota freighter í miðleik?", "Treat freighter as moving HQ: storage centralization, expedition uptime, og portable uppsetning utility."],
    ["14) Get ég flutt bækistöð án vandræða?", "Já — settu upp kjarnaaðstöðu á nýja staðnum, færðu nauðsynleg innviði og haltu teleport-tengingum við eldri bú."],
    ["15) Hvernig held ég uppfærslum traustum milli plástra?", "Prioritize universal value: slot count, logistics speed, lifun, og consistent income over gimmick loops."],
    ["16) Besta leiðin til að höndla Sentinels?", "Avoid prolonged escalation unless intentional; break line-of-sight og endurstilla when objective is exploration eða öflun."],
    ["17) Hversu mörgum skipum ætti ég að viðhalda?", "Keep role-based ships only if each has hreinsa purpose; otherwise maintenance overhead slows framvinda."],
    ["18) Eru settlements aðalvélin í framvindu?", "Usually side efni value, not top-tier account acceleration."],
    ["19) Ætti ég að nota coordinates/glyphs í miðleik?", "Use them fyrir targeted hunts eða bottlenecks; free exploration remains best fyrir discovery spilalotur."],
    ["20) Góð venja gegn kulnun í miðleik?", "Rotate one hagkerfi hringur, one exploration goal, og one uppsetning task per spilalota."],

    ["21) Auðlindastefna í lokaleik?", "Automate extraction/refining where possible, then spend playtime on high-value goals, not manual grind."],
    ["22) Mikilvægasta langtímafínstillingin?", "Route compression: fewer menu trips, fewer transfers, faster travel between recurring objectives."],
    ["23) Hvað ætti ég að mín-maxa fyrst?", "Main ship utility + exosuit slots + freighter logistics áður en cosmetic mega-projects."],
    ["24) Er þess virði að skipuleggja sig í kringum expeditions?", "Já, fyrir einstök reikningsverðlaun; staðfestu dagsetningar í opinberum rásum og forgangsraðaðu skilvirkni áfanga."],
    ["25) Hvernig undirbý ég mig örugglega fyrir stórar uppfærslur?", "Keep spare key auðlindir og avoid overcommitting to one brittle farm pipeline."],
    ["26) Besta uppsetningin á lokaleiks-spilalotu?", "Start með maintenance (expeditions/storage), run one focused objective, finish með valfrjálst exploration."],
    ["27) Er permadeath þess virði að prófa?", "Frábært ef þú kannt að meta agað skipulag; hafðu áhættuglugga stutta og útgönguleiðir fyrirfram ákveðnar."],
    ["28) Hvernig held ég lokaleiknum skemmtilegum?", "Set themed projects (fleet, base, fauna, photo leiðir) instead of pure skilvirkni grind."],
    ["29) Áreiðanleg sérfræðiregla?", "Byggðu kerfi sem virka áfram þó skapið, plásturinn eða markmiðin breytist."],
    ["30) Kjarnaráð sem þú getur treyst?", "Notaðu NMS fyrst sem flæðis- og skipulagsleik, síðan sem safnleik; framvindan verður mýkri og síður brothætt."]
  ],
  nioh: [
    ["1) Er þessi leiðsögn traust þó Nioh 3 breytist?", "Já — einbeittu þér að sannaðri Nioh-grunnfærni: Ki-stjórn, fjarlægðarskyn, varnaragi og tímasettum refsingum."],
    ["2) Stærstu byrjendamistökin?", "Að eyða öllu Ki í sókn og festast í endurheimt án varnarmöguleika."],
    ["3) Hvað ætti ég að æfa fyrst?", "Guard tímasetning, Ki pulse rhythm, og one áreiðanleg combo leið per stance."],
    ["4) Ættu byrjendur að halda sig við eitt vopn?", "Aðalvopnaðu þig með einu vopni fyrst, hafðu aukavopn fyrir ólíkar aðstæður og fyrirðastu stöðug vopnaskipti."],
    ["5) Létt eða þung uppsetning snemma?", "Choose the load that preserves hreyfing og Ki comfort; control beats raw armor greed."],
    ["6) Eru magic/ninjutsu tools valfrjálst?", "Optional but high-value; even light utility investment improves stöðugleiki og recovery gluggar."],
    ["7) Hvernig ætti ég að ráðstafa stigum snemma?", "Meet requirements, stabilize lifun/Ki, then scale skaði eftir baseline comfort is stöðug."],
    ["8) Besta leiðin til að læra bossabardaga?", "Run stutt attempts focused on identifying 2-3 safe punish gluggar og retreat patterns."],
    ["9) Aðeins fyrirðun eða líka blokk?", "Notaðu bæði. Blönduð vörn er öruggari en að treysta einni lausn fyrir öll mynstur."],
    ["10) Kjarnaregla snemma í leiknum?", "Never enter a dangerous exchange without enough Ki to defend afterward."],

    ["11) Hver er fókusinn í miðleik?", "Refine stöðugleiki: cleaner stance transitions, fewer greedy strings, better utility tímasetning."],
    ["12) Ætti ég að fínstilla búnaður hart í miðleik?", "Target high-impact uppfærslur fyrst; full min-max can wait until uppsetning identity is fixed."],
    ["13) Hversu mikilvæg eru set bonus í miðleik?", "Helpful, but only if they stuðningur your actual bardagi rhythm og lifun."],
    ["14) Soul matching núna eða seinna?", "Use selectively; avoid heavy auðlind burn on búnaður you’ll replace soon."],
    ["15) Hvernig tek ég á endurteknum dauðsföllum?", "Lower complexity: shorten combos, simplify tools, og re-establish safe defensive habits."],
    ["16) Er samspil gott til að læra?", "Great fyrir smoothing framvinda, but still æfa einspili reps to læra enemy telegraphs cleanly."],
    ["17) Besta loot-umsýsluvenjan?", "Dismantle/cull aggressively með hreinsa reglur so birgðir never blocks spilalota momentum."],
    ["18) Eru status uppsetnings áreiðanleg?", "Já when they stuðningur uptime og safety, not when they force risky overextensions."],
    ["19) Forgangur í hæfileiki-tree í miðleik?", "Core passives, Ki hagkerfi, og repeatable bread-og-butter options áður en niche tech."],
    ["20) Viðmið fyrir skilvirkni í miðleik?", "Fewer avoidable hits, faster resets, og consistent clears under pressure."],

    ["21) Hvenær á ég að byrja á fullu mín-maxi?", "After campaign stöðugleiki, when búnaður turnover slows og your leikstíll is locked in."],
    ["22) Heimspeki uppsetningar í lokaleik?", "Optimize fyrir áreiðanleiki fyrst, then stack skaði once vörn og Ki flow are solved."],
    ["23) Hversu oft ætti ég að skipta um uppsetningu?", "Deliberately og rarely; frequent pivots yfirleitt erase mastery gains."],
    ["24) Hvað aðgreinir sterka spilara í lokaleik?", "Decision gæði under pressure: when to disengage, endurstilla Ki, og re-enter safely."],
    ["25) Er fjarlægðar utility still relevant lokaleikur?", "Já—fyrir controlled pulls, tempó resets, og safer multi-markmið handling."],
    ["26) Besti tékklistinn fyrir bossabardaga?", "Load/agility athugun, healing stock, shortcut readiness, utility setup, og fyrst-phase áætlun."],
    ["27) Hvernig geri ég uppsetningu plástraþolna?", "Hafðu eitt sveigjanlegt sæti í búnaður/tooling svo jafnvægisbreytingar geri ekki alla uppsetninguna úrelta."],
    ["28) Besta anti-tilt rútínan?", "Eftir tvær slakar tilraunir: gerðu hlé, farðu yfir einn mistakaflokk og komdu til baka með eitt skýrt leiðréttingarmarkmið."],
    ["29) Áreiðanleg langtímaröð í framvindu?", "Ki stöðugleiki -> vörn stöðugleiki -> punish uptime -> skaði fínstilling."],
    ["30) Kjarnaráð sem þú getur treyst?", "Náðu fyrst tökum á tempóstjórnun; allt annað í Nioh-stíl bardaga byggir á því."]
  ],
  hytale: [
    ["1) Besti fókusinn fyrstu vikuna?", "Set up one stöðug framvinda hringur fyrst: áreiðanleg búnaður uppfærslur, hreyfing comfort, og auðlind flow."],
    ["2) Stærstu snemma mistök leikmanna?", "Trying to fínstilla everything at once instead of mastering one complete hringur."],
    ["3) Ætti ég að forgangsraða bardagi eða uppsetningu fyrst?", "Prioritize whichever unlocks your bottleneck, but keep both progressing so account/world growth stays balanced."],
    ["4) Hvernig fyrirðast að sóa snemma auðlindir?", "Spend on uppfærslur that bæta stöðugleiki (lifun, mobility, kjarna tools), not flashy side kerfi."],
    ["5) Er einspili framvinda raunhæf?", "Já, en samspil can accelerate öflun og difficult efni if coordination is good."],
    ["6) Besta leiðin til að velja uppsetningarleið?", "Pick one leikstíll that feels natural, then commit long enough to læra its breakpoints."],
    ["7) Hversu mörg kerfi ætti ég að grinda í einu?", "One main kerfi plus one stuðningur kerfi is yfirleitt optimal snemma."],
    ["8) Hvernig met ég hvort leiðarvísir sé góður?", "Athugaðu uppfærsluplástur/version date, test scope, og whether tradeoffs are explained skýrt."],
    ["9) Traustasta framvindureglan?", "Consistency beats spikes: steady uppfærslur outperform risky high-roll gambles."],
    ["10) Ætti ég að elta snemma meta leiðir í blindni?", "Nei. Verify they still work on current uppfærsluplástur og match your leikstíll."],
    ["11) Hvernig minnka ég niðurtíma í spilalotum?", "Hópaðu markmið: gather, craft, og complete nearby goals in one leið."],
    ["12) Er birgðir discipline mikilvægt?", "Já. Clean birgðir flow prevents wasted time og accidental auðlind starvation."],
    ["13) Besta venjan fyrir lifun?", "Always keep fallback tools ready og avoid entering new zones underprepared."],
    ["14) Hvernig kemst ég út úr framvindustoppi?", "Identify the single biggest blocker og solve that áður en broad grinding."],
    ["15) Ætti ég að sérhæfa mig snemma eða vera sveigjanlegur?", "Specialize enough to gain momentum, but keep a flexible backup option."],
    ["16) Er hreyfing fínstilling þess virði að æfa?", "Já. Better hreyfing raises both lifun og öflun skilvirkni."],
    ["17) Hvernig avoid kulnun?", "Set stutt milestones, rotate activities, og stop áður en skilvirkni collapses."],
    ["18) Besta leiðin til að takast á við erfiða bardaga?", "Lærðu mynstur í stuttum lotum og komdu svo aftur með eina markvissa aðlögun."],
    ["19) Ætti ég að hamstra allt efni?", "Nei. Hoard key bottleneck efni, spend the rest to maintain momentum."],
    ["20) Hver er áreiðanleg uppfærsluröð?", "Lifun -> kjarnaskaði/nytsemi -> lífsgæðauppfærslur."],
    ["21) Er samspil alltaf faster?", "Only when roles are hreinsa; disorganized samspil can be slower than einspili skilvirkni."],
    ["22) Hvernig fyrirðast ég að uppsetningar virki slappar í miðleik?", "Recheck scaling path, uppfærsla breakpoints, og synergy gaps áður en rerolling."],
    ["23) Ætti ég að endurstilla oft when experimenting?", "Experiment in controlled gluggar; constant resets destroy langtíma momentum."],
    ["24) Besta leiðin til að prep fyrir new uppfærsluplástur changes?", "Keep flexible auðlindir banked og avoid overcommitting to one fragile leið."],
    ["25) Hvernig met ég hvort efni sé þess virði að farma?", "Measure reward per time og whether it solves current framvinda needs."],
    ["26) Er fínstilling þess virði it fyrir casual leikmenn?", "Light fínstilling gives big gains without turning the game into spreadsheet work."],
    ["27) Hvað should lengra kominn leikmenn fínstilla fyrst?", "Route skilvirkni, uppfærsla sequencing, og low-risk high-value repeatables."],
    ["28) Hvernig know when to pivot stefna?", "Pivot when your current hringur stops giving meaningful gains per spilalota."],
    ["29) Áreiðanlegasta langtíma venja?", "Review your framvinda áætlun every few spilalotur og trim low-value activities."],
    ["30) Kjarnaráð sem þú getur treyst?", "Play með intention: stöðug loops, hreinsa priorities, og uppfærsluplástur-aware adjustments win langtíma."]
  ],
  valheim: [
    ["1) Besti forgangur fyrsta dags?", "Secure shelter, basic food variety, og a safe spawn-adjacent workbench hringur áður en long exploration."],
    ["2) Algengustu byrjendamistökin?", "Rushing bosses without proper food tiers, rested buff uptime, og a backup recovery kit."],
    ["3) Er rested buff really that mikilvægt?", "Já. It massively improves stamina/health recovery og should be maintained almost constantly."],
    ["4) Bestu snemma weapons?", "Use what you can sustain reliably; spear/bow/club combinations are practical snemma depending on comfort."],
    ["5) Ætti ég að setja upp main base snemma?", "Build a modest functional base fyrst, then expand eftir auðlind leiðir are mapped."],
    ["6) Hversu mikilvæg er matarframvinda?", "Critical. Better food is one of the largest lifun og framvinda multipliers."],
    ["7) Er öflun þess virði doing snemma?", "Já once unlocked—consistent food supply removes major framvinda friction."],
    ["8) Solo eða samspil easier?", "Co-op smooths bardagi og hauling, but einspili is fully viable með good prep discipline."],
    ["9) Besta leiðin til að minnka vesen eftir dauða?", "Carry portal efni, maintain backup búnaður, og never overextend without exit leiðir."],
    ["10) Ætti ég að ofuruppfæra varnir snemma?", "Basic perimeter og awareness yfirleitt beat expensive over-fortification too snemma."],
    ["11) Er bow mandatory?", "Not mandatory, but fjarlægðar control is extremely valuable in many encounters."],
    ["12) Hvernig approach each new biome?", "Scout edges fyrst, test enemies, og uppfærsla búnaður áður en deep commits."],
    ["13) Bestu stamina management venja?", "Never empty stamina bar completely; reserve enough fyrir vörn og retreat."],
    ["14) Er parry tímasetning þess virði nám?", "Já, parry stöðugleiki can dramatically bæta bardagi safety og skilvirkni."],
    ["15) Besta flutningsstefnan í miðleik?", "Build leið infrastructure (roads/ports/portals) to cut repeat travel costs."],
    ["16) Ætti ég að hoard everything?", "Nei. Keep organized kjarna efni og convert surplus into uppsetning/framvinda value."],
    ["17) Eru portals overpowered?", "They’re intended logistics tools; using them smartly reduces grind fatigue."],
    ["18) Bestu anti-frustration tip?", "Split risky trips into stutt objectives með áreiðanleg return plans."],
    ["19) Hvernig prep fyrir boss attempts?", "Food tier, resist prep, repair athugun, og a clean arena matter more than bravado."],
    ["20) Get ég skip base aesthetics?", "Já snemma. Function-fyrst base design accelerates framvinda."],
    ["21) Besta leiðin til að train bardagi confidence?", "Practice enemy patterns in controlled fights near safe fallback zones."],
    ["22) Er shield usage þess virði it?", "Já, especially while nám timings og threat fjarlægð."],
    ["23) Hvernig held ég samspilshópum skilvirkum?", "Assign roles: scout, byggjandi, farmer, logistics, og rotate when bored."],
    ["24) Hvað to uppfærsla fyrst yfirleitt?", "Tools + lifun + mobility uppfærslur áður en cosmetic expansion."],
    ["25) Ætti ég að elta leiðbeiningar fyrir everything?", "Use leiðbeiningar fyrir bottlenecks, but leave room fyrir discovery so framvinda stays fun."],
    ["26) Hvernig reduce grind feeling?", "Batch gather runs, fínstilla leiðir, og avoid single-auðlind tunnel vision."],
    ["27) Er base location choice huge?", "Já. Access to mixed biomes/leiðir saves massive langtíma time."],
    ["28) Áreiðanlegasta late-game venja?", "Always prep redundancies: spare búnaður, food reserves, og leið backups."],
    ["29) Er death penalty manageable?", "Já, með planning. Hún er hörð en sanngjörn once logistics discipline is built."],
    ["30) Ein traust meta-regla í Valheim?", "Preparation beats reflexes more oft than not."]
  ],
  endfield: [
    ["1) Hvað ætti ég að forgangsraða fyrstu vikuna?", "Build one stöðug kjarna squad fyrst, unlock essential kerfi, then branch into sérhæfa migd teams."],
    ["2) Stærstu framvinda mistake new leikmenn make?", "Spreading auðlindir across too many units snemma og delaying kjarna-lið power spikes."],
    ["3) Hversu margar einingar ætti ég að fjárfesta alvarlega í snemma?", "Usually one main lið plus 1–2 flex units fyrir mechanics coverage."],
    ["4) Ætti ég að elta every new banner?", "Nei. Pull around role gaps og langtíma account áætlun, not hype cycles."],
    ["5) Hvað matters more: rarity eða lið fit?", "Team fit og role synergy yfirleitt outperform raw rarity."],
    ["6) Besta leiðin til að nota stamina skynsamlega?", "Prioritize account-unlock efni og guaranteed framvinda auðlindir áður en luxury öflun."],
    ["7) Er dagleg stöðugleiki really better than long spilalotur?", "Já. Reliable dagleg framvinda compounds harder than occasional marathon play."],
    ["8) Ætti ég að rush saga eða side kerfi fyrst?", "Push saga until key kerfi unlock, then balance framvinda og auðlind öflun."],
    ["9) Besta leiðin til að fyrirðast stöðnun á account?", "Audit bottlenecks vikuleg: skaði athugun, sustain athugun, og uppfærsla material shortages."],
    ["10) Hvernig vel ég næstu einingu til að levela?", "Pick units that solve current blockers, not units that only increase ceiling."],
    ["11) Er auto-battle enough fyrir framvinda?", "Use auto fyrir repetition, but læra difficult mechanics manually to avoid bad habits."],
    ["12) Hvenær á ég að byrja að fínstilla búnaður/relics?", "After your kjarna lið can hreinsa routine efni reliably."],
    ["13) Ætti F2P leikmenn copy spender strategies?", "Nei. Resource pacing og pull discipline are more mikilvægt fyrir F2P stöðugleiki."],
    ["14) Hvernig fyrirðast að sóa premium currency?", "Set pull budgets in advance og stick to them even during hype banners."],
    ["15) Hver er traust regla fyrir liðsuppsetningu?", "Cover essential roles fyrst: sustained skaði, lifun, utility/control."],
    ["16) Hvernig handle difficulty spikes?", "Fix role gaps og uppfærsla breakpoints áður en brute-force retries."],
    ["17) Er rerolling þess virði it langtíma?", "Only if done snemma með a hreinsa markmið; otherwise lost framvinda yfirleitt costs more."],
    ["18) Ætti ég að hoard all auðlindir forever?", "Nei. Hoard selectively, but spend enough to keep momentum og unlock efni."],
    ["19) Hvernig met ég hvort eining sé virkilega góð?", "Look at role compression, stöðugleiki, og uppfærsla cost skilvirkni in real efni."],
    ["20) Besta leiðin til að farm viðburður shops?", "Prioritize highest-value limited auðlindir fyrst, then fill með general framvinda hlutir."],
    ["21) Hversu mörg teams do I need fyrir lokaleikur-style efni?", "Develop one excellent lið fyrst, then a annað sérhæfa migd roster."],
    ["22) Er min-maxing snemma account stats þess virði it?", "Only eftir your baseline framvinda hringur is stöðug og repeatable."],
    ["23) Hvað should I do when community advice conflicts?", "Prefer advice með uppfærsluplástur/date stamps og hreinsa testing methodology."],
    ["24) Hvernig avoid kulnun?", "Set vikuleg milestones, stop eftir high-value tasks, og skip low-impact grind."],
    ["25) Ætti ég að invest in niche units snemma?", "Yfirleitt nei — byggðu fyrst upp traustan grunn áður en þú ferð í niche-fínstillingu."],
    ["26) Hver er öruggasta langtímaframvinduhugsunin?", "Consistency over spikes: steady uppfærslur beat feast-eða-famine auðlind dumps."],
    ["27) Hversu oft ætti ég að yfirfara reikningsáætlunina?", "After each major uppfærsluplástur/viðburður cycle eða when framvinda stalls."],
    ["28) Besta leiðin til að undirbúa nýtt efni eftir plástra?", "Bank kjarna uppfærsla efni og keep one flexible slot in your investment áætlun."],
    ["29) Hvað is the highest-value venja fyrir account strength?", "Never let stamina og dagleg kjarna tasks go to waste."],
    ["30) Kjarnaráð sem þú getur treyst?", "Build a stöðug grunnur, spend með intention, og adapt quickly to uppfærsluplástur changes."]
  ],
  poe2: [
    ["1) Er Path of Exile 2 byrjendavænt?", "It is deep og demanding; byrjandi success comes from following a samræmd uppsetning áætlun snemma."],
    ["2) Stærstu snemma mistake?", "Improvising passive trees without a áætlun, then hitting scaling walls."],
    ["3) Ætti ég að nota uppsetningarguide?", "Já fyrir fyrst character—then branch out once you understand itemization og defenses."],
    ["4) Er offense enough to carry framvinda?", "Nei. Layered defenses + recovery + uptime matter as much as DPS fyrir stöðug framvinda."],
    ["5) Bestu fyrst-character mindset?", "Prioritize stöðugleiki og lifun over flashy but fragile skaði paths."],
    ["6) Er currency spending snemma dangerous?", "Já. Save high-value currency until uppfærsla value is hreinsa."],
    ["7) Hversu mikilvægar eru resistance-varnir?", "Critical. Keep resist og kjarna defenses healthy through every framvinda phase."],
    ["8) Ætti ég að craft snemma eða buy uppfærslur?", "Use low-risk crafting fyrir basics; buy key uppfærslur when value is obvious."],
    ["9) Fljótlegasta leiðin til að bæta gæði uppsetningar?", "Identify weakest slot og biggest defensive gap fyrst, then uppfærsluplástur systematically."],
    ["10) Er hreyfing hæfileiki forgangur high?", "Já—mobility og repositioning greatly bæta lifun og hreinsa speed."],
    ["11) Hvernig fyrirðast ég ringulreið í stash?", "Sort by function: crafting base hlutir, sellable rares, currency, og uppsetning-critical búnaður."],
    ["12) Ætti ég að copy lokaleikur uppsetnings too snemma?", "Nei, many require expensive breakpoints og feel bad áður en completion."],
    ["13) Besta leiðin til að læra boss fights?", "Short focused reps: læra telegraphs og safe gluggar instead of brute forcing."],
    ["14) Hvernig evaluate item uppfærslur quickly?", "Athugaðu whether uppfærsla solves current bottleneck (skaði uptime, vörn gap, sustain)."],
    ["15) Er group play alltaf better fyrir progress?", "Not alltaf. Coordination gæði matters more than party size."],
    ["16) Hvað kills most new leikmenn in ARPG lokaleikur?", "Ignoring layered vörn og relying on skaði-only logic."],
    ["17) Ætti ég að reroll oft?", "Only when uppsetning is structurally broken; frequent rerolls hægur mastery."],
    ["18) Er viðskipti mandatory?", "Depends on goals, but viðskipti yfirleitt accelerates framvinda significantly."],
    ["19) Hvernig vel ég öflun-stefnu?", "Choose efni your uppsetning handles safely og repeatedly, then scale skilvirkni."],
    ["20) Bestu anti-kulnun approach?", "Set stutt economic goals og rotate activities instead of endless one-hringur grinding."],
    ["21) Eru tier lists enough fyrir decisions?", "Nei. Build comfort og budget constraints matter as much as tier rank."],
    ["22) Ætti ég að elta perfect hlutir snemma?", "Nei. Incremental uppfærslur outperform perfection chasing fyrir most leikmenn."],
    ["23) Hvernig keep deaths from snowballing?", "Pause, identify failure source, og fix one defensive weakness at a time."],
    ["24) Er flask/micro-management þess virði it?", "Já, good utility management is a major performance multiplier."],
    ["25) Áreiðanlegasta reglan um gjaldmiðla?", "Spend where it unlocks framvinda, not where it looks flashy."],
    ["26) Hvernig veit ég hvenær uppsetning er kort-ready?", "Stable hreinsa speed, survivable boss attempts, og no frequent one-shots."],
    ["27) Bestu snemma markaður behavior?", "Sell useful mid-tier hlutir quickly og avoid overholding speculative birgðir."],
    ["28) Ætti ég að force meta if I dislike leikstíll?", "Usually no—stöðugleiki drops when the uppsetning doesn’t fit your rhythm."],
    ["29) Reliable framvinda forgangur order?", "Defenses -> sustain -> skaði scaling -> gæði-of-life."] ,
    ["30) Kjarnaráð sem þú getur treyst?", "Run a samræmd áætlun, uppfærsluplástur weaknesses snemma, og uppfærsla deliberately."]
  ],
  kcd2: [
    ["1) Er KCD2 bardagi hæfileiki-based?", "Já. Timing, fjarlægð, stamina control, og preparation matter far more than rushing."],
    ["2) Besta byrjunarvenjan?", "Treat snemma hours as a training phase: stabilize peningar, food, búnaður condition, og bardagi fundamentals áður en ambition spikes."],
    ["3) Er búnaður enough to win hard fights?", "Nei. Skill framvinda og fight selection matter heavily."],
    ["4) Ætti ég að pick every fight?", "Nei. Avoid bad odds, pick cleaner engagements, og use terrain advantage."],
    ["5) Er stamina management crucial?", "Absolutely—empty stamina oft means immediate punishment."],
    ["6) Besta leiðin til að make peningar snemma?", "Reliable legal loops og quest rewards beat risky crime spirals snemma."],
    ["7) Hvernig æfi ég bardaga á skilvirkan hátt?", "Short focused spar spilalotur og controlled encounters uppsetning stöðugleiki."],
    ["8) Ætti ég að neglect speech/utility hæfileikar?", "Nei. Non-bardagi options save time, peningar, og risk."],
    ["9) Er stealth raunhæf?", "Já, when approached patiently með visibility/noise discipline."],
    ["10) Bestu birgðir discipline regla?", "Carry what supports your current objective; avoid over-encumbrance penalties."],
    ["11) Hvernig prep áður en dangerous quests?", "Repair búnaður, stock healing/food, og save með a hreinsa fallback leið."],
    ["12) Er horse management mikilvægt?", "Já, mobility og storage gæði significantly affect world skilvirkni."],
    ["13) Ætti ég að rush main saga?", "Pacing side framvinda oft produces smoother main-saga difficulty."],
    ["14) Hvernig reduce frustration in duels?", "Focus on vörn gluggar og clean counter tímasetning áður en aggression."],
    ["15) Er reputation impactful?", "Usually yes—social consequences influence options og outcomes."],
    ["16) Bestu anti-death spiral stefna?", "Reset tempó, avoid tilt-fights, og return með better prep."],
    ["17) Er lockpicking/theft þess virði nám?", "Useful, but keep legal consequences og roleplay goals in mind."],
    ["18) Ætti ég að min-max instantly?", "Nei. Learn kerfi fyrst, fínstilla later."],
    ["19) Besta leiðin til að læra kort leiðir?", "Use repeated stutt loops between high-value hubs áður en long trips."],
    ["20) Er heavy armor alltaf better?", "Not alltaf—mobility og stamina costs can outweigh raw protection."],
    ["21) Hvernig handle multiple enemies?", "Disengage, funnel space, og avoid open surround situations."],
    ["22) Er bow use þess virði að æfa?", "Já, fjarlægðar control can simplify difficult engagements."],
    ["23) Traustasta félagslega stefnan?", "Invest in speech options og read quest context áður en committing."],
    ["24) Hvernig stýri ég save-skrám skynsamlega?", "Use regular framvinda checkpoints og avoid huge unsaved risk chains."],
    ["25) Besta leiðin til að keep roleplay + skilvirkni?", "Set character reglur, then fínstilla within those boundaries."],
    ["26) Ætti ég að grind one hæfileiki only?", "Balanced development yfirleitt gives better overall mission flexibility."],
    ["27) Hvernig bæti ég slæmt eðaðspor?", "Use consistent lawful behavior, complete helpful tasks, og avoid repeat offenses."],
    ["28) Er night gameplay safer?", "Situational—better fyrir stealth, riskier fyrir visibility/navigation."],
    ["29) Most áreiðanleg framvinda forgangur?", "Survivability, stöðug income, travel skilvirkni, then luxury uppfærslur."],
    ["30) Kjarnaráð sem þú getur treyst?", "Play patient, prepare well, og respect the simulation."]
  ],
  wwm: [
    ["1) Bestu fyrstu viku forgangur?", "Build a stöðug kjarna hringur: one áreiðanleg bardagi setup, one income/material leið, og one mobility leið."],
    ["2) Stærstu snemma mistake?", "Spreading uppfærslur across too many kerfi áður en a kjarna uppsetning is functional."],
    ["3) Ætti ég að min-max immediately?", "Nei. Early stöðugleiki og lifun beat fragile high-risk fínstilling."],
    ["4) Hvernig vel ég uppsetningarleið?", "Pick one leikstíll that feels natural, then commit long enough to hit key power breakpoints."],
    ["5) Hvað ætti ég að uppfæra fyrst?", "Prioritize lifun, kjarna skaði uptime, og hreyfing/control tools áður en niche uppfærslur."],
    ["6) Er exploration-fyrst raunhæf?", "Já, if you pair it með practical framvinda goals so exploration feeds uppfærslur."],
    ["7) Besta leiðin til að fyrirðast auðlindasóun?", "Spend on uppfærslur that solve current bottlenecks, not on speculative future uppsetnings."],
    ["8) Ætti ég að use leiðbeiningar right away?", "Use them fyrir bottlenecks only; avoid copying full leiðir í blindni without uppfærsluplástur/version checks."],
    ["9) Hvernig met ég hvort leiðbeining sé áreiðanlegur?", "Prefer leiðbeiningar með uppfærsluplástur-date tags, test conditions, og explicit tradeoffs."],
    ["10) Áreiðanlegasta snemma-game regla?", "One strong uppsetning online fyrst; everything else is secondary."],

    ["11) Hvað skilgreinir góða miðleiksframvindu?", "Consistent hreinsa speed, low death rate, og repeatable auðlind gains per spilalota."],
    ["12) Hversu margar uppsetningar ætti ég að keyra í miðleik?", "One primary uppsetning plus one flexible backup is yfirleitt optimal."],
    ["13) Besta leiðin til að break framvinda plateaus?", "Identify the single biggest blocker (skaði, vörn, eða sustain) og fix that fyrst."],
    ["14) Er samspil alltaf more skilvirk?", "Only með hreinsa role coordination; disorganized samspil oft wastes time."],
    ["15) Ætti ég að hamstra allt efni?", "Nei. Hoard bottleneck auðlindir; spend the rest to keep momentum."],
    ["16) Hvernig bæta fight stöðugleiki?", "Learn enemy patterns in stutt reps og reduce greedy punish attempts."],
    ["17) Er búnaður fínstilling þess virði doing mid-game?", "Já, en fókus on high-impact slots fyrst instead of full-set perfection."],
    ["18) Bestu anti-kulnun stefna?", "Run stutt objective-based spilalotur og stop when skilvirkni drops."],
    ["19) Hvernig ætti ég að takast á við misvísandi ráð frá samfélaginu?", "Triangulate multiple sources og prefer method-backed testing over opinions."],
    ["20) Mid-game hagkerfi regla of thumb?", "Favor repeatable leiðir með stöðug returns over volatile high-risk spikes."],

    ["21) Hvað ætti lokaleiksfínstilling að forgangsraða?", "Route skilvirkni, encounter stöðugleiki, og uppfærsla sequencing."],
    ["22) Er perfect-búnaður chasing þess virði it?", "Only eftir your baseline setup is already strong og stöðug."],
    ["23) Hvernig met ég hvort uppsetning sé tilbúin fyrir lokaleik?", "It handles markmið efni consistently without relying on perfect execution every run."],
    ["24) Besta leiðin til að prep fyrir major uppfærsluplástra?", "Keep flexible auðlindir banked og avoid overcommitting to one fragile meta leið."],
    ["25) How oft should I re-evaluate my uppsetning?", "After each uppfærsluplástur cycle eða whenever performance plateaus."],
    ["26) Ætti ég að pivot uppsetnings oft in lokaleikur?", "Pivot deliberately, not reactively; frequent swaps yfirleitt kill progress."],
    ["27) Hver er öruggasta hástigs framvinduhugsunin?", "Consistency over spikes, kerfi over hype, og measured adaptation."],
    ["28) Hvernig maintain langtíma account/world health?", "Trim low-value loops regularly og reinvest into highest-return kerfi."],
    ["29) Most áreiðanleg lengra kominn-leikmaður venja?", "Track your own results og iterate based on evidence, not trend chasing."],
    ["30) Kjarnaráð sem þú getur treyst?", "Build a stöðug engine fyrst, then fínstilla aggressively með uppfærsluplástur-aware decisions."]
  ],
  fo76: [
    ["1) Er Fallout 76 þess virði að byrja í núna?", "Já, especially if you like samspil sandbox framvinda og seasonal live updates."],
    ["2) Besta level-stefnan snemma?", "Quest framvinda + viðburður participation + smart perk planning beats random grinding."],
    ["3) Er uppsetning planning mikilvægt snemma?", "Já. Early perk direction prevents costly mid-level inefficiency."],
    ["4) Ætti ég að rush main saga?", "Progress it steadily fyrir unlocks, but mix in events fyrir auðlindir og XP."],
    ["5) Bestu byrjandi weapon approach?", "Use ammo-skilvirk, áreiðanleg weapons áður en specializing heavily."],
    ["6) Er CAMP placement a big decision?", "Já—auðlind access, travel convenience, og safety all matter."],
    ["7) Hvernig fyrirðast ég birgðavesen?", "Scrap oft, stash smart, og avoid hoarding low-value heavy hlutir."],
    ["8) Er food/water management still mikilvægt?", "Less punishing than launch era, but consumable management still improves uptime."],
    ["9) Besta leiðin til að farm caps reliably?", "Run high-value events, do consistent vendor leiðir, og sell practical demand hlutir (ammo/plans/utility búnaður) at sane prices."],
    ["10) Er joining teams þess virði it?", "Já. Public teams give useful bonuses og smoother viðburður completion."],
    ["11) Ætti ég að óttast PVP?", "You can mostly avoid unwanted PVP með settings og situational awareness."],
    ["12) Bestu anti-ammo-starvation tip?", "Use weapons you can sustain og craft in bulk when efni are skilvirk."],
    ["13) Hvernig forgangsraða ég SPECIAL/perks?", "Build around one primary skaði archetype plus lifun utility."],
    ["14) Er crafting central to langtíma power?", "Já, especially fyrir búnaður maintenance og controlled framvinda."],
    ["15) Bestu viðburður participation venja?", "Join high-value public events consistently fyrir XP, loot, og plans."],
    ["16) Ætti ég að elta perfect legendary rolls snemma?", "Nei. Build functional baseline búnaður áður en perfection hunting."],
    ["17) Er mutation setup þess virði it?", "Já later, once you can manage downsides og stuðningur perks properly."],
    ["18) Hvernig lækka ég hraður-travel kostnað?", "Use strategic CAMP placement og free travel points effectively."],
    ["19) Besta leiðin til að læra kort hagkerfi?", "Track what actually sells in leikmaður vendors og adjust birgðir fókus."],
    ["20) Er einspili viable in FO76?", "Já, fully viable, though teams accelerate events og XP gain."],
    ["21) Hvernig hætti ég að over-repaira og over-crafta?", "Craft to need, not fear; excessive stockpiling burns auðlindir."],
    ["22) Bestu dagleg routine fyrir progress?", "High-value events, key dailies, stash maintenance, then targeted goals."],
    ["23) Ætti ég að run one universal uppsetning?", "Use one strong primary uppsetning fyrst; swap only when auðlindir allow."],
    ["24) Hversu mikilvæg eru resistance- og lifunar-perks?", "Very—skaði is useless if you can’t stay active in fights."],
    ["25) Besta leiðin til að farm plans/recipes?", "Consistent viðburður rotation og vendor checks beat random wandering."],
    ["26) Er power armor mandatory?", "Nei. Many strong non-PA uppsetnings exist; pick by leikstíll preference."],
    ["27) Hvernig avoid kulnun in seasonal cycles?", "Set vikuleg objectives og skip low-value grinds."],
    ["28) Er leikmaður trading þess virði doing?", "Já, if you læra pricing og sell practical demand hlutir."],
    ["29) Áreiðanlegasta new-leikmaður regla?", "Optimize fyrir sustainability fyrst, fínstilling annað."],
    ["30) Kjarnaráð sem þú getur treyst?", "Run a samræmd uppsetning, keep stash/auðlind discipline, og farm events on a repeatable vikuleg rhythm."]
  ],
  elden: [
    ["1) Mikilvægasti forgangurinn í byrjun Elden Ring?", "Get lifun online fyrst: Vigor investment, upgraded weapon, og flask uppfærslur áður en chasing high-risk bosses."],
    ["2) Algengustu byrjendamistökin?", "Spreading stats too thin too snemma og under-investing Vigor."],
    ["3) Hversu mikilvægt er Vigor í raun?", "Mjög. Þetta er áreiðanlegasta vörnin gegn one-shot í mestu af framvindunni."],
    ["4) Ætti ég að fylgja uppsetningarleiðbeiningu strax?", "Using a simple starter framework helps, but keep flexibility until your preferred leikstíll is hreinsa."],
    ["5) Hvað matters more snemma: stats eða weapon uppfærslur?", "Weapon uppfærsla level yfirleitt gives bigger immediate power spikes than minor stat points."],
    ["6) Er summoning spirit ashes valid?", "Algjörlega. Þetta eru ætlað verkfæri og geta stöðgað erfiðar viðureignir."],
    ["7) Ætti ég að hreinsa every valfrjálst boss when found?", "Nei. If a fight feels overtuned fyrir current búnaður, mark it og return later."],
    ["8) Bestu rune management venja?", "Spend runes áður en risky pushes og avoid carrying large losses into unknown zones."],
    ["9) Hvernig kanna ég svæði á skilvirkan hátt?", "Finndu fyrst kortabrot, síðan nálæg grace-punkt og svo markvissa yfirferð um svæðið."],
    ["10) Er shield play raunhæf?", "Já—guard counters og disciplined blocking are very strong in many matchups."],
    ["11) Er dodge-only play required?", "Nei. Það er oft öruggara að blanda fjarlægð, blokk og fyrirðun en að spamma fyrirðun."],
    ["12) Besta leiðin til að bæta boss stöðugleiki?", "Learn 2–3 punish gluggar, keep stamina reserve, og avoid greed extensions."],
    ["13) Ætti ég að dual-wield snemma?", "Only if your stamina management og positioning are stöðug; it’s strong but punishable."],
    ["14) Er magic easier than melee?", "Magic can smooth many fights, but positioning og auðlind discipline still matter."],
    ["15) Hvernig vel ég Ashes of War?", "Pick one that matches your weapon scaling og bardagi rhythm, not just raw tooltip hype."],
    ["16) Er öflun runes snemma þess virði it?", "Some öflun is fine, but leið knowledge + uppfærslur yfirleitt outperform long grind spilalotur."],
    ["17) Hvernig fyrirðast ég uppsetningareftirsjá?", "Commit to one skaði stat path snemma og delay niche side scaling until miðleik."],
    ["18) Besta leiðin til að handle status-heavy enemies?", "Use resistance prep, fjarlægð discipline, og quicker kill gluggar over prolonged trades."],
    ["19) Er poise mikilvægt?", "Já fyrir certain setups. It improves viðskipti stöðugleiki, especially fyrir aggressive melee plans."],
    ["20) Ætti ég að use heavy armor alltaf?", "Only if you stay within comfortable equip load og mobility."],
    ["21) Hvenær should I respec?", "Respec when your kjarna uppsetning identity changes, not fyrir tiny fínstilling impulses."],
    ["22) Hvernig undirbý ég mig fyrir legacy dungeons?", "Bring upgraded weapon, enough flask balance, og status/utility options fyrir mixed enemy packs."],
    ["23) Eru consumables þess virði using?", "Já. Buffs og utility hlutir can swing difficult fights significantly."],
    ["24) Bestu anti-tilt stefna?", "Take stutt endurstilla breaks og return með one specific adjustment áætlun."],
    ["25) Er samspil gott til að læra?", "Já fyrir momentum og confidence, but einspili reps teach move recognition fastest."],
    ["26) Hvernig met ég talisman-val?", "Prioritize lifun og uppsetning-enabling effects áður en niche skaði boosts."],
    ["27) Ætti ég að elta meta weapons immediately?", "Only if they match your stat path; forced meta choices can hægur framvinda."],
    ["28) Áreiðanlegasta framvinda order?", "Explore, uppfærsla, return—do not brute-force walls með underleveled tools."],
    ["29) Tékklisti fyrir lokaleik?", "High Vigor, refined flask setup, upgraded main/backup weapon, og practiced stamina discipline."],
    ["30) Kjarnaráð sem þú getur treyst?", "Build fyrir stöðugleiki fyrst, skaði annað; patience og preparation win the long game."]
  ]
};

function renderDynamicFaqs() {
  document.querySelectorAll('.dynamic-faq').forEach(container => {
    const key = container.dataset.game;
    const hlutir = faqData[key] || [];

    const snemma = hlutir.slice(0, 10);
    const mid = hlutir.slice(10, 20);
    const end = hlutir.slice(20, 30);

    const renderBlock = (title, arr) => `
      <div class="phase-block">
        <div class="phase-title">${title}</div>
        ${arr.kort(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
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

// Athugasemd viðhaldsaðila: hver leikur á að halda nákvæmlega 30 atriðum (10 byrjun, 10 miðleikur, 10 lokaleikur)
// svo stigablokkir haldist byggingarlega samræmdar milli flipa.

console.log('Night Vibes expanded game tabs hlaðið inn ✅');
