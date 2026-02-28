const SAVE_KEY='abg_v08_save';
const SLOTS=['weapon','offhand','helm','shoulders','chest','gloves','boots','ring1','ring2','amulet','belt'];
const SETS=['Vanguard','Wildheart','Astral'];

const state={
  wave:1,highestWave:0,gold:0,wins:0,running:false,paused:false,tick:null,speed:1,
  talentPts:0,autoMode:true,mode:'push',combo:0,
  stats:{waveKills:0,dmgDealt:0,dmgTaken:0,wavesCleared:0,lastWaveMs:0,waveStartTs:0},
  watchdog:{noChangeTicks:0,lastTotalHp:0},
  shopHealLv:0,shopReviveLv:0,shopAtkLv:0,shopHpLv:0,shopCritLv:0,shopCritDmgLv:0,shopDefLv:0,
  teamBuffAtk:0,teamBuffHp:0,teamBuffCrit:0,teamBuffCritDmg:0,teamBuffDef:0,
  talents:{secondWind:false,bloodlust:false,echo:false,treasure:false,battleRhythm:false,giantSlayer:false,atkPctLv:0,hpPctLv:0},
  waveAtkStack:0,
  playerName:'Commander',
  party:[mkHero('Warrior','assets/warrior-human.svg',78,11,'block')],
  unlockedSlots:1,
  nextHeroUnlockWave:20,
  pendingHeroUnlock:false,
  enemies:[],equipHeroIdx:0,shopBuyAmount:1,showTotalStats:true
};

function mkHero(name,icon,hp,atk,skill){
  const equip={}; SLOTS.forEach(s=>equip[s]=null);
  return {name,icon,maxHp:hp,hp,atk,alive:true,skill,cd:0,abilityCd:0,tempShield:0,gearAtk:0,gearHp:0,gearCrit:0,lvl:1,xp:0,advClass:null,equip,secondWindUsed:false,focus:0,setAtk:0,setHp:0,setCrit:0,setArmor:0,setSkillMult:0,setCdr:0,setLeech:0};
}

function setHeroLevel(hero,targetLevel){
  const lvl=Math.max(1,Math.floor(targetLevel||1));
  while(hero.lvl<lvl){
    hero.lvl++;
    hero.maxHp+=6;
    hero.atk+=2;
  }
  hero.xp=0;
  hero.hp=heroMaxHp(hero);
  hero.alive=true;
}
function heroTemplate(cls){
  if(cls==='Warrior') return mkHero('Warrior','assets/warrior-human.svg',78,11,'block');
  if(cls==='Ranger') return mkHero('Ranger','assets/ranger-human.svg',58,14,'crit');
  return mkHero('Mage','assets/mage-human.svg',52,15,'burst');
}

function openHeroUnlockChoice(){
  if(state.unlockedSlots>=3) return;
  const pool=['Warrior','Ranger','Mage'];
  const owned=new Set(state.party.map(h=>h.name));
  const choices=pool.filter(c=>!owned.has(c));
  const wrap=$('heroUnlockChoices');
  state.pendingHeroUnlock=true;
  wrap.innerHTML=choices.map(c=>`<button data-unlock-hero='${c}'>${c}</button>`).join('');
  $('heroUnlockContinueBtn').disabled=true;
  $('heroUnlockModal').classList.remove('hidden');
}

function unlockHeroByChoice(heroClass){
  if(state.unlockedSlots>=3) return;
  const newHero=heroTemplate(heroClass);
  const beforeCount=state.party.length;
  if(beforeCount===1){
    const baseLevel=(state.party[0]?.lvl||1)-5;
    setHeroLevel(newHero,baseLevel);
  }else if(beforeCount===2){
    const avgLevel=state.party.reduce((s,h)=>s+(h.lvl||1),0)/2;
    setHeroLevel(newHero,avgLevel-5);
  }
  state.party.push(newHero);
  state.unlockedSlots=state.party.length;
  state.nextHeroUnlockWave=state.unlockedSlots===2?50:null;
  state.pendingHeroUnlock=false;
  $('heroUnlockContinueBtn').disabled=false;
  log(`🧭 Reinforcement joined: ${heroClass} at Lv ${newHero.lvl}! Party slots: ${state.unlockedSlots}/3`);
  save();
  draw();
}

function mkEnemy(i,w,boss=false){
  const icons=['assets/monster-goblin.svg','assets/monster-wolf.svg','assets/monster-ogre.svg'];
  const lateScale=1+Math.max(0,w-8)*0.04;
  const expectedSlots=w>=50?3:w>=20?2:1;
  const slotScale=0.8 + expectedSlots*0.2;
  const baseHp=((boss?58:16)+w*(boss?10:2.2))*lateScale*slotScale;
  const baseAtk=((boss?9:3)+w*(boss?1.5:0.65))*(1+Math.max(0,w-10)*0.03)*(0.85+expectedSlots*0.15);
  const types=boss?['Boss']:['Brute','Skirmisher','Shaman'];
  const type=types[(i+w)%types.length];
  let hp=baseHp, atk=baseAtk, armor=0, haste=0, healer=false, elite=false;
  if(type==='Brute'){ hp*=1.28; atk*=0.9; armor=2; elite=w>=14; }
  if(type==='Skirmisher'){ hp*=0.86; atk*=1.14; haste=0.24; }
  if(type==='Shaman'){ hp*=0.95; atk*=0.98; healer=true; }
  if(type==='Boss'){ hp*=1.05; atk*=1.04; armor=3; haste=0.12; elite=true; }
  let affix=null;
  if(elite || boss){
    const pool=['Vampiric','Bastion','Frenzied'];
    affix=pool[(w+i+(boss?1:0))%pool.length];
    if(affix==='Vampiric') atk*=1.08;
    if(affix==='Bastion'){ armor+=2; hp*=1.08; }
    if(affix==='Frenzied') haste+=0.12;
  }
  const xp=Math.round((boss?16:4)+w*1.5 + (elite?2:0) + (affix?2:0));
  const gold=Math.round((boss?8:2)+w*0.6 + (elite?2:0) + (affix?1:0));
  return {name:boss?`Boss ${w}`:`Mob ${i+1}`,type,icon:icons[i%icons.length],maxHp:Math.round(hp),hp:Math.round(hp),atk:Math.round(atk),alive:true,boss,xp,gold,armor,haste,healer,elite,affix,markedTurns:0,markedAmp:0};
}

const $=id=>document.getElementById(id);
const alive=a=>a.filter(x=>x.alive);
const pick=a=>{const x=alive(a);return x[Math.floor(Math.random()*x.length)]};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const comboMult=()=>1+Math.min(0.25,(state.combo||0)*0.0125);
const fmtNum=n=>Math.round(n).toLocaleString();

function pickEnemyTarget(){
  const enemies=state.enemies.filter(e=>e && e.alive && Number.isFinite(e.hp) && Number.isFinite(e.maxHp) && e.hp>0 && e.maxHp>0);
  if(!enemies.length) return null;

  // If marked targets exist, still prioritize them.
  const marked=enemies.filter(e=>(e.markedTurns||0)>0);
  if(marked.length) return marked.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];

  // Hybrid targeting: mostly focus weakest, sometimes spread pressure.
  const sorted=[...enemies].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));
  const focus=Math.random()<0.7;
  if(focus) return sorted[0];

  // Pick from upper survivors to avoid one brute being ignored forever.
  const altPool=sorted.slice(1);
  if(!altPool.length) return sorted[0];
  return altPool[Math.floor(Math.random()*altPool.length)];
}
function pickHeroTarget(){
  const heroes=state.party.filter(h=>h && h.alive && Number.isFinite(h.hp) && h.hp>0);
  if(!heroes.length) return null;
  return heroes.sort((a,b)=>(a.hp/heroMaxHp(a))-(b.hp/heroMaxHp(b)))[0];
}

function log(t){$('log').innerHTML=`<div>${t}</div>`+$('log').innerHTML}
function lootLog(t,cls=''){ $('loot').innerHTML=`<div class='${cls}'>${t}</div>`+$('loot').innerHTML }

const costByLevel=(base,step,lv)=>base+lv*step;
const healCost=()=>costByLevel(8,4,state.shopHealLv);
const reviveCost=()=>costByLevel(14,6,state.shopReviveLv);
const atkCost=()=>costByLevel(16,9,state.shopAtkLv);
const hpCost=()=>costByLevel(16,9,state.shopHpLv);
const critCost=()=>costByLevel(20,10,state.shopCritLv);
const critDmgCost=()=>costByLevel(24,12,state.shopCritDmgLv);
const defCost=()=>costByLevel(18,10,state.shopDefLv);
const TALENT_COST=5;
const TALENT_PCT_TIERS=[5,10,15,20,25];

function xpToNext(h){ return 20 + (h.lvl-1)*12; }
function heroCrit(h){ return (h.skill==='crit'?0.2:0.08) + h.gearCrit + h.setCrit + state.teamBuffCrit + (h.advClass==='Sniper'?0.12:0) + h.focus*0.001; }
function heroAtk(h){
  let v=h.atk+state.teamBuffAtk+h.gearAtk+h.setAtk+state.waveAtkStack;
  const atkPct=TALENT_PCT_TIERS.slice(0,state.talents.atkPctLv||0).reduce((s,x)=>s+x,0)/100;
  v=Math.floor(v*(1+atkPct));
  if(h.advClass==='Berserker' && h.hp/heroMaxHp(h)<0.45) v+=Math.ceil(v*0.22);
  if(h.advClass==='Warlock') v+=2;
  if(h.focus>=80) v+=2;
  return v;
}
function heroMaxHp(h){
  let v=h.maxHp+state.teamBuffHp+h.gearHp+h.setHp;
  const hpPct=TALENT_PCT_TIERS.slice(0,state.talents.hpPctLv||0).reduce((s,x)=>s+x,0)/100;
  v=Math.floor(v*(1+hpPct));
  if(h.advClass==='Paladin') v+=16;
  if(h.advClass==='Warden') v+=10;
  return v;
}
function enemyArmor(e){ return Math.max(0,e.armor||0); }
function dealDamageToEnemy(attacker,enemy,raw){
  let dmg=Math.max(1,Math.floor(raw*comboMult()));
  if(enemy.markedTurns>0) dmg=Math.floor(dmg*(1+enemy.markedAmp));
  if(state.talents.giantSlayer && (enemy.boss||enemy.elite)) dmg=Math.floor(dmg*1.18);
  dmg=Math.max(1,dmg-enemyArmor(enemy));
  enemy.hp-=dmg;
  state.stats.dmgDealt=(state.stats.dmgDealt||0)+dmg;
  const eid=state.enemies.indexOf(enemy);
  if(eid>=0) floatText(`e${eid}`,`-${dmg}`);
  if(attacker.setLeech>0) attacker.hp=Math.min(heroMaxHp(attacker),attacker.hp+Math.ceil(dmg*attacker.setLeech));
  if(enemy.hp<=0&&enemy.alive){ enemy.alive=false; onEnemyKilled(enemy,attacker); }
  return dmg;
}

function recomputeGearStats(hero){
  hero.gearAtk=0; hero.gearHp=0; hero.gearCrit=0;
  hero.setAtk=0; hero.setHp=0; hero.setCrit=0; hero.setArmor=0; hero.setSkillMult=0; hero.setCdr=0; hero.setLeech=0;
  const setCounts={Vanguard:0,Wildheart:0,Astral:0};
  SLOTS.forEach(s=>{
    const it=hero.equip[s]; if(!it) return;
    hero.gearAtk+=it.atk||0; hero.gearHp+=it.hp||0; hero.gearCrit+=it.crit||0;
    if(it.set && setCounts[it.set]!=null) setCounts[it.set]++;
  });
  if(setCounts.Vanguard>=2){ hero.setHp+=12; hero.setArmor+=1; }
  if(setCounts.Vanguard>=4){ hero.setAtk+=3; }
  if(setCounts.Wildheart>=2){ hero.setCrit+=0.04; }
  if(setCounts.Wildheart>=4){ hero.setLeech+=0.08; }
  if(setCounts.Astral>=2){ hero.setAtk+=2; }
  if(setCounts.Astral>=4){ hero.setCdr+=1; hero.setSkillMult+=0.12; }
  hero.hp=Math.min(hero.hp,heroMaxHp(hero));
}

function drawList(id,arr,isParty=true){
  $(id).innerHTML=arr.map(u=>`<div class='unit ${u.alive?'':'dead'}'>
      <div>
        <div class='name'><img class='mini-ico' src='${u.icon}' alt=''> ${u.name}${u.boss?' 👑':''}${u.advClass?` • ${u.advClass}`:''}${!isParty?` • ${u.type}`:''}</div>
        <div class='hpbar'><span style='width:${isParty?clamp((Math.max(0,u.hp)/heroMaxHp(u))*100,0,100):clamp((Math.max(0,u.hp)/u.maxHp)*100,0,100)}%'></span></div>
        ${isParty?`<small>Lv ${u.lvl} • XP ${u.xp}/${xpToNext(u)} • ATK ${heroAtk(u)} • Focus ${Math.floor(u.focus||0)} • Skill CD ${u.abilityCd||0}${u.tempShield?` • Shield ${u.tempShield}`:''}</small>`:`<small>ATK ${u.atk} • Armor ${enemyArmor(u)}${u.markedTurns>0?` • Marked ${u.markedTurns}`:''}${u.affix?` • ${u.affix}`:''}</small>`}
      </div>
      <div>${isParty?'':(u.healer?'🪄':u.affix==='Frenzied'?'🔥':u.affix==='Bastion'?'🧱':u.affix==='Vampiric'?'🩸':'⚔️')}</div>
    </div>`).join('');
}
function drawBattlefield(){
  $('partyLane').innerHTML=state.party.map((u,i)=>`<div class='sprite ${u.alive?'':'dead'}' id='p${i}'><img src='${u.icon}' alt=''></div>`).join('');
  $('enemyLane').innerHTML=state.enemies.map((u,i)=>`<div class='sprite enemy ${u.alive?'':'dead'}' id='e${i}'><img src='${u.icon}' alt=''></div>`).join('');
}
function drawReviveTargets(){
  const fallen=state.party.map((h,i)=>({h,i})).filter(x=>!x.h.alive||x.h.hp<=0);
  $('reviveTargets').innerHTML=fallen.map(x=>`<button data-revive='${x.i}'>Revive ${x.h.name}</button>`).join('');
}
function drawClassChoices(){
  state.party.forEach((h,i)=>{
    const anchor=$(`classChoice${i}`); if(anchor) anchor.remove();
    if(h.lvl>=10 && !h.advClass){
      const wrap=document.createElement('div'); wrap.id=`classChoice${i}`; wrap.className='mini-actions';
      const [a,b]=advancedOptions(h.name);
      wrap.innerHTML=`<button data-class='${a}' data-i='${i}'>${a}</button><button data-class='${b}' data-i='${i}'>${b}</button>`;
      $('party').prepend(wrap);
    }
  });
}
function skillName(h){
  if(h.name==='Warrior') return h.advClass==='Berserker'?'Rage Slam':'Guardian Cry';
  if(h.name==='Ranger') return h.advClass==='Sniper'?'Deadeye Volley':'Volley';
  return h.advClass==='Warlock'?'Soul Drain':'Arcane Nova';
}
function drawSkillBar(){
  $('skillBar').innerHTML=state.party.map((h,i)=>{
    const disabled=!h.alive||h.abilityCd>0||!state.enemies.length;
    return `<button data-skill='${i}' ${disabled?'disabled':''} title='Use ${skillName(h)} (Empowered at 50 Focus)'>${h.name}: ${skillName(h)} ${h.abilityCd>0?`(${h.abilityCd})`:''}</button>`;
  }).join('');
}
function slotText(it){
  return it?`${it.name} (+${it.atk} ATK / +${it.hp} HP${it.crit?` / +${Math.round(it.crit*100)}% crit`:''})`:'— empty —';
}
function slotIcon(slot){
  const icons={weapon:'⚔️',offhand:'🛡️',helm:'🪖',shoulders:'🦾',chest:'🧥',gloves:'🧤',boots:'🥾',ring1:'💍',ring2:'💍',amulet:'📿',belt:'🪢'};
  return icons[slot]||'⬚';
}
function rarityClass(it){
  if(!it) return '';
  return it.rarity==='Legendary'?'rarity-legendary':it.rarity==='Mythic'?'rarity-mythic':'rarity-rare';
}
function setLine(name,count){
  if(count===0) return `${name}: 0`;
  return `<b>${name}</b>: ${count}`;
}
function drawEquipUI(){
  $('equipHeroList').innerHTML=state.party.map((h,i)=>`<button class='hero-pill ${i===state.equipHeroIdx?'active':''}' data-ehero='${i}'>${h.name} Lv${h.lvl}</button>`).join('');
  const h=state.party[state.equipHeroIdx];
  const counts={Vanguard:0,Wildheart:0,Astral:0};
  SLOTS.forEach(s=>{ const it=h.equip[s]; if(it?.set&&counts[it.set]!=null) counts[it.set]++; });
  $('setSummary').innerHTML=`Set bonuses: ${setLine('Vanguard',counts.Vanguard)} • ${setLine('Wildheart',counts.Wildheart)} • ${setLine('Astral',counts.Astral)}`;
  const slot=(key,label)=>{
    const it=h.equip[key];
    const setTag=it?.set?` • ${it.set}`:'';
    return `<div class='slot slot-${key} ${rarityClass(it)}'><b><span class='slot-ico'>${slotIcon(key)}</span> ${label}</b><span>${slotText(it)}${setTag}</span></div>`;
  };
  $('equipSlots').innerHTML=`
    ${slot('shoulders','Shoulders')}
    ${slot('helm','Helm')}
    ${slot('amulet','Amulet')}
    ${slot('weapon','Weapon')}
    <div class='pdoll'><div class='pdoll-label'>${h.name} • ${h.advClass||'Base Class'}</div></div>
    ${slot('offhand','Offhand')}
    ${slot('gloves','Gloves')}
    ${slot('chest','Chest')}
    ${slot('ring1','Ring 1')}
    ${slot('belt','Belt')}
    ${slot('boots','Boots')}
    ${slot('ring2','Ring 2')}
  `;
}

function drawBattleStats(){
  const s=state.stats;
  const secs=Math.max(0,Math.round((Date.now()-(s.waveStartTs||Date.now()))/1000));
  $('battleStats').innerHTML=[
    ['Wave kills', fmtNum(s.waveKills||0)],
    ['Damage dealt', fmtNum(s.dmgDealt||0)],
    ['Damage taken', fmtNum(s.dmgTaken||0)],
    ['Waves cleared', fmtNum(s.wavesCleared||0)],
    ['Current wave time', `${secs}s`],
    ['Last clear time', s.lastWaveMs?`${(s.lastWaveMs/1000).toFixed(1)}s`:'—']
  ].map(([k,v])=>`<div class='stat-row'><span>${k}</span><span>${v}</span></div>`).join('');
}

function drawTotalStats(){
  const partyLvTotal=state.party.reduce((s,h)=>s+(h.lvl||1),0);
  const avgLv=state.party.length?partyLvTotal/state.party.length:1;
  const totalAtk=state.party.reduce((s,h)=>s+heroAtk(h),0);
  const totalMaxHp=state.party.reduce((s,h)=>s+heroMaxHp(h),0);
  const totalCrit=state.party.reduce((s,h)=>s+heroCrit(h),0);
  const avgCrit=state.party.length?totalCrit/state.party.length:0;
  $('totalStats').innerHTML=[
    ['Party size', `${state.party.length}/3`],
    ['Total party level', fmtNum(partyLvTotal)],
    ['Average party level', avgLv.toFixed(1)],
    ['Combined ATK', fmtNum(totalAtk)],
    ['Combined Max HP', fmtNum(totalMaxHp)],
    ['Average Crit', `${(avgCrit*100).toFixed(1)}%`],
    ['Team Defense', fmtNum(state.teamBuffDef||0)],
    ['Team Crit Dmg Bonus', `${Math.round((state.teamBuffCritDmg||0)*100)}%`]
  ].map(([k,v])=>`<div class='stat-row'><span>${k}</span><span>${v}</span></div>`).join('');
}

function draw(){
  $('wave').textContent=state.wave; $('highestWave').textContent=state.highestWave; $('gold').textContent=state.gold; $('wins').textContent=state.wins;
  $('comboLabel').textContent=`x${comboMult().toFixed(2)}`;
  $('speedLabel').textContent=`${state.speed}x`; $('talentPts').textContent=state.talentPts;
  $('modeLabel').textContent=state.mode==='push'?'Push':'Grind';
  $('vsLabel').textContent=state.wave%5===0?'BOSS':'AUTO';
  $('startBtn').textContent=state.running?'In Combat':'Start / Resume';
  $('pauseBtn').textContent=state.paused?'Resume':'Pause';
  $('healBtn').textContent=`Heal Party (${healCost()}g)`;
  $('reviveBtn').textContent=`Revive KO Ally (${reviveCost()}g)`;
  $('atkBtn').textContent=`+2 Team ATK (${atkCost()}g)`;
  $('hpBtn').textContent=`+10 Team Max HP (${hpCost()}g)`;
  $('critBtn').textContent=`+1% Team Crit (${critCost()}g)`;
  $('critDmgBtn').textContent=`+5% Team Crit Dmg (${critDmgCost()}g)`;
  $('defBtn').textContent=`+1 Team Defense (${defCost()}g)`;
  $('talAtkPct').textContent=`Might Training (+5/10/15/20/25%) [${state.talents.atkPctLv||0}/5] (5 pt)`;
  $('talHpPct').textContent=`Fortitude Training (+5/10/15/20/25%) [${state.talents.hpPctLv||0}/5] (5 pt)`;
  $('shopBalanceInfo').innerHTML=`Shop scaling: Heal +4/lv • Revive +6/lv • ATK/HP +9/lv • Crit +10/lv • CritDmg +12/lv • Def +10/lv`;
  $('toggleTotalStatsBtn').textContent=state.showTotalStats?'Hide':'Show';
  $('totalStatsWrap').classList.toggle('hidden',!state.showTotalStats);
  [1,5,10,'max'].forEach(v=>{ const el=$(`buyAmt${String(v).toUpperCase()}`); if(el) el.classList.toggle('active',state.shopBuyAmount===v); });
  drawList('party',state.party,true); drawList('enemies',state.enemies,false); drawBattlefield();
  drawReviveTargets(); drawClassChoices(); drawEquipUI(); drawSkillBar(); drawBattleStats(); drawTotalStats();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    if(!s) return false;
    Object.assign(state,s);
    state.party=s.party;
    return true;
  }catch{ return false; }
}

function spawnWave(w=state.wave){
  const boss=w%5===0;
  state.enemies=boss?[mkEnemy(0,w,true)]:Array.from({length:Math.min(5,2+Math.floor(w/2))},(_,i)=>mkEnemy(i,w,false));
  state.waveAtkStack=0;
  state.combo=0;
  state.stats.waveKills=0;
  state.stats.dmgDealt=0;
  state.stats.dmgTaken=0;
  state.stats.waveStartTs=Date.now();
  state.watchdog.noChangeTicks=0;
  state.watchdog.lastTotalHp=0;
  state.party.forEach(h=>h.secondWindUsed=false);
}
function startWave(){
  if(state.running) return;
  const liveEnemies=alive(state.enemies).length;
  if(!state.enemies.length || liveEnemies===0){
    state.enemies=[];
    spawnWave(state.wave);
  }
  state.running=true;
  state.paused=false;
  draw();
  loop();
}

function jumpToWave(targetWave){
  clearInterval(state.tick);
  state.running=false;
  state.paused=false;
  state.enemies=[];
  state.bossPending=false;
  state.wave=targetWave;
  spawnWave(state.wave);
  draw();
  startWave();
}

function loop(){ clearInterval(state.tick); state.tick=setInterval(()=>{ if(!state.paused) step(); }, Math.max(130,540/state.speed)); }

function flash(id){const el=$(id); if(!el) return; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');}
function markTarget(id){ const el=$(id); if(!el) return; el.classList.add('target'); setTimeout(()=>el.classList.remove('target'),220); }
function bossWarn(id){ const el=$(id); if(!el) return; el.classList.add('boss-warn'); setTimeout(()=>el.classList.remove('boss-warn'),500); }
function floatText(id,text){ const el=$(id); if(!el) return; const f=document.createElement('span'); f.className='float'; f.textContent=text; el.appendChild(f); setTimeout(()=>f.remove(),520); }
function vfxAt(id,kind='slash'){ const el=$(id); if(!el) return; const fx=document.createElement('span'); fx.className=`fx ${kind}`; el.appendChild(fx); setTimeout(()=>fx.remove(),240); }
function gainFocus(h,amount){ h.focus=clamp((h.focus||0)+amount,0,100); }

function onEnemyKilled(enemy,killer){
  state.stats.waveKills=(state.stats.waveKills||0)+1;
  const goldGain=Math.max(1,Math.round(enemy.gold*(state.talents.treasure?1.5:1)));
  state.gold+=goldGain; state.wins++; log(`💰 ${enemy.name} dropped ${goldGain}g`);
  gainXp(killer,enemy.xp);
  gainFocus(killer,12);
  state.combo=Math.min(20,(state.combo||0)+1);
  if(state.combo>0 && state.combo%5===0) log(`🔥 Combo surged to ${state.combo} (${comboMult().toFixed(2)}x damage)`);
  if(state.combo>0 && state.combo%8===0){ state.gold+=2; log('✨ Combo bonus +2g'); }
  if(state.talents.bloodlust){ state.waveAtkStack=Math.min(10,state.waveAtkStack+1); }
  if(state.talents.battleRhythm){ state.party.forEach(h=>{ if(h.alive&&h.abilityCd>0) h.abilityCd=Math.max(0,h.abilityCd-1); }); }
  maybeDropItem(enemy);
}

function castHeroSkill(i){
  const h=state.party[i];
  if(!h||!h.alive||h.abilityCd>0||!alive(state.enemies).length) return;
  const empowered=(h.focus||0)>=50;
  if(empowered) h.focus=Math.max(0,h.focus-50);
  const setMult=1+(h.setSkillMult||0)+(empowered?0.2:0);
  if(h.name==='Warrior'){
    const shield=Math.floor((h.advClass==='Berserker'?8:14) * (empowered?1.35:1));
    state.party.forEach(p=>{ if(p.alive) p.tempShield=(p.tempShield||0)+shield; });
    if(h.advClass==='Berserker'){
      const t=pick(state.enemies); if(t){ dealDamageToEnemy(h,t,heroAtk(h)*1.25*setMult); vfxAt(`e${state.enemies.indexOf(t)}`,'crit'); }
    }
    log(`🛡️ ${h.name} used ${skillName(h)}${empowered?' (Empowered)':''}.`);
  }else if(h.name==='Ranger'){
    const mult=(h.advClass==='Sniper'?0.95:0.7)*setMult;
    alive(state.enemies).forEach(t=>{ dealDamageToEnemy(h,t,heroAtk(h)*mult); t.markedTurns=2; t.markedAmp=(h.advClass==='Sniper'?0.32:0.2); vfxAt(`e${state.enemies.indexOf(t)}`,'slash'); });
    log(`🏹 ${h.name} used ${skillName(h)}${empowered?' (Empowered)':''}.`);
  }else{
    const t=pick(state.enemies); if(!t) return;
    const mult=(h.advClass==='Warlock'?1.8:1.4)*setMult;
    dealDamageToEnemy(h,t,heroAtk(h)*mult); vfxAt(`e${state.enemies.indexOf(t)}`,'burst');
    if(h.advClass==='Warlock') h.hp=Math.min(heroMaxHp(h),h.hp+(empowered?16:10));
    log(`✨ ${h.name} cast ${skillName(h)}${empowered?' (Empowered)':''}.`);
  }
  h.abilityCd=8;
  draw();
}

function heroAttack(a,b){
  let dmg=heroAtk(a);
  const critChance=heroCrit(a);
  if(Math.random()<critChance){
    const critMult=(a.advClass==='Sniper'?2.1:1.75)*(1+state.teamBuffCritDmg);
    dmg=Math.floor(dmg*critMult);
    log(`💥 ${a.name} crit!`); vfxAt(`e${state.enemies.indexOf(b)}`,'crit');
  }
  if(a.skill==='burst' && a.cd<=0){
    const targets=alive(state.enemies).slice(0,a.advClass==='Sorcerer'?3:2);
    targets.forEach(x=>{ dealDamageToEnemy(a,x,dmg*0.72); vfxAt(`e${state.enemies.indexOf(x)}`,'burst'); });
    a.cd=4;
    gainFocus(a,10);
    return;
  }
  dealDamageToEnemy(a,b,dmg); vfxAt(`e${state.enemies.indexOf(b)}`,'slash');
  if(a.name==='Ranger'){ b.markedTurns=2; b.markedAmp=(a.advClass==='Sniper'?0.3:0.16); }
  if(a.advClass==='Paladin'){ const t=alive(state.party).sort((x,y)=>x.hp/heroMaxHp(x)-y.hp/heroMaxHp(y))[0]; if(t){ t.hp=Math.min(heroMaxHp(t),t.hp+4); } }
  if(a.advClass==='Warlock'){ a.hp=Math.min(heroMaxHp(a),a.hp+2); }
  if(state.talents.echo && Math.random()<0.15 && b.alive){ dealDamageToEnemy(a,b,dmg*0.4); vfxAt(`e${state.enemies.indexOf(b)}`,'burst'); }
  gainFocus(a,8);
  if(a.cd>0) a.cd--;
}
function enemyAttack(c,d){
  if(c.boss) bossWarn(`e${state.enemies.indexOf(c)}`);
  if(c.healer && Math.random()<0.22){
    const ally=alive(state.enemies).sort((x,y)=>(x.hp/x.maxHp)-(y.hp/y.maxHp))[0];
    if(ally && ally.hp<ally.maxHp){
      const heal=Math.ceil(c.atk*1.2); ally.hp=Math.min(ally.maxHp,ally.hp+heal);
      log(`🪄 ${c.name} mended ${ally.name} for ${heal}.`); vfxAt(`e${state.enemies.indexOf(ally)}`,'burst');
      return;
    }
  }
  let dmg=c.atk;
  if(c.affix==='Frenzied' && c.hp/c.maxHp<0.5) dmg=Math.floor(dmg*1.18);
  if(d.skill==='block' && Math.random()<0.26){dmg=Math.floor(dmg*0.55); vfxAt(`p${state.party.indexOf(d)}`,'block');}
  if(d.tempShield>0){
    const absorbed=Math.min(dmg,d.tempShield); d.tempShield-=absorbed; dmg-=absorbed;
    if(absorbed>0) vfxAt(`p${state.party.indexOf(d)}`,'block');
  }
  dmg=Math.max(1,dmg-(d.setArmor||0)-state.teamBuffDef);
  if(dmg>0){
    const final=Math.max(1,dmg);
    d.hp-=final;
    state.stats.dmgTaken=(state.stats.dmgTaken||0)+final;
    const pid=state.party.indexOf(d);
    if(pid>=0) floatText(`p${pid}`,`-${final}`);
  }
  vfxAt(`p${state.party.indexOf(d)}`,'hitfx');
  if(c.affix==='Vampiric' && dmg>0){ c.hp=Math.min(c.maxHp,c.hp+Math.ceil(dmg*0.2)); }
  if(c.affix==='Bastion' && Math.random()<0.15){ c.hp=Math.min(c.maxHp,c.hp+2); }
  gainFocus(d,6);
  if(d.hp<=0&&d.alive){
    if(state.talents.secondWind && !d.secondWindUsed){ d.secondWindUsed=true; d.hp=Math.ceil(heroMaxHp(d)*0.3); log(`🪽 ${d.name} triggered Second Wind!`); return; }
    d.alive=false; state.combo=0; log(`${c.name} downed ${d.name} (combo reset)`);
  }
}
function step(){
  // Defensive cleanup: normalize stale/inconsistent entity states before resolving actions.
  state.targetSwapTick=(state.targetSwapTick||0)+1;
  state.enemies = state.enemies.filter(x => x && Number.isFinite(x.hp));
  state.enemies.forEach(x=>{ if(x.hp<=0) x.alive=false; });
  state.party.forEach(x=>{ if(x.hp<=0) x.alive=false; });
  const p=alive(state.party), e=alive(state.enemies);
  if(!p.length||!e.length) return endWave();

  const a=pick(p);
  let b=pickEnemyTarget()||pick(e);
  // Periodic forced target swap to distribute aggro and avoid visual "ignored mob" feel.
  if(state.targetSwapTick%7===0){
    const pool=e.filter(x=>x!==b);
    if(pool.length) b=pool[Math.floor(Math.random()*pool.length)];
  }
  if(!b || !b.alive) return endWave();
  markTarget(`e${state.enemies.indexOf(b)}`);
  heroAttack(a,b); flash(`e${state.enemies.indexOf(b)}`);

  const e2=alive(state.enemies);
  if(!e2.length) return endWave();

  const c=pick(e2), d=pickHeroTarget()||pick(p);
  if(!c || !d) return endWave();
  markTarget(`p${state.party.indexOf(d)}`);
  enemyAttack(c,d); flash(`p${state.party.indexOf(d)}`);

  if(c.alive && c.haste>0 && Math.random()<c.haste){
    const d2=pickHeroTarget()||pick(alive(state.party));
    if(d2){ enemyAttack(c,d2); flash(`p${state.party.indexOf(d2)}`); }
  }

  state.party.forEach(h=>{
    if(h.abilityCd>0) h.abilityCd=Math.max(0,h.abilityCd-1-(h.setCdr||0));
    if(h.tempShield>0) h.tempShield=Math.max(0,h.tempShield-1);
  });
  state.enemies.forEach(x=>{ if(x.markedTurns>0) x.markedTurns--; });

  // Stuck-wave watchdog: if total HP across both teams doesn't change for too long, soft-reset wave.
  const totalHp = alive(state.party).reduce((s,x)=>s+Math.max(0,x.hp),0) + alive(state.enemies).reduce((s,x)=>s+Math.max(0,x.hp),0);
  if(state.watchdog.lastTotalHp===totalHp){
    state.watchdog.noChangeTicks++;
  } else {
    state.watchdog.noChangeTicks=0;
    state.watchdog.lastTotalHp=totalHp;
  }
  if(state.watchdog.noChangeTicks>24){
    log('🧯 Watchdog: combat stalled, soft-resetting current wave.');
    state.running=false;
    state.enemies=[];
    spawnWave(state.wave);
    startWave();
    return;
  }

  draw();
}

function gainXp(hero,amt){
  hero.xp+=amt;
  while(hero.xp>=xpToNext(hero)){
    hero.xp-=xpToNext(hero); hero.lvl++; hero.maxHp+=6; hero.atk+=2; hero.hp=Math.min(heroMaxHp(hero),hero.hp+8);
    log(`🌟 ${hero.name} reached Lv ${hero.lvl}`);
    if(hero.lvl%3===0) state.talentPts+=2;
  }
}
function advancedOptions(name){
  if(name==='Warrior') return ['Paladin','Berserker'];
  if(name==='Ranger') return ['Sniper','Warden'];
  return ['Sorcerer','Warlock'];
}

function itemScore(it){ return it.atk*2 + it.hp*0.25 + (it.crit||0)*120 + (it.set?2:0); }
function mkItem(w){
  const rarityRoll=Math.random();
  const rarity=rarityRoll<0.68?'Rare':rarityRoll<0.93?'Mythic':'Legendary';
  const mult=rarity==='Rare'?1:rarity==='Mythic'?1.45:1.95;
  const slot=SLOTS[Math.floor(Math.random()*SLOTS.length)];
  const ilvl=Math.max(1,Math.round(w + Math.random()*3));
  const atk=Math.max(0,Math.round((1+Math.random()*2+ilvl*0.07)*mult));
  const hp=Math.max(2,Math.round((4+Math.random()*7+ilvl*0.35)*mult));
  const crit=(slot.includes('ring')||slot==='amulet')? Number((0.01*mult).toFixed(3)) : 0;
  // Set items only appear on Mythic (purple) and Legendary tiers.
  const set=(rarity==='Mythic' || rarity==='Legendary')
    ? SETS[(slot.length + ilvl + Math.floor(Math.random()*5))%SETS.length]
    : null;
  return {name:`${rarity} ${slot} i${ilvl}`,rarity,slot,atk,hp,crit,set,scrap:Math.round(3*mult + w*0.5)};
}
function maybeDropItem(enemy){
  const chance=(enemy.boss?0.9:0.18) * (state.talents.treasure?1.25:1) * (enemy.affix?1.12:1);
  if(Math.random()>chance) return;
  const item=mkItem(state.wave);
  const hero=state.party[Math.floor(Math.random()*state.party.length)];
  const current=hero.equip[item.slot];
  const delta=Math.round((itemScore(item)-itemScore(current||{atk:0,hp:0,crit:0}))*10)/10;
  const hint=current?` (${delta>=0?'+':''}${delta} score vs equipped)`:` (+new slot)`;
  if(!current || itemScore(item)>itemScore(current)){
    hero.equip[item.slot]=item; recomputeGearStats(hero);
    const cls=item.rarity==='Legendary'?'loot-l':item.rarity==='Mythic'?'loot-m':'loot-r';
    const setTag=item.set?` [${item.set}]`:'';
    lootLog(`🧩 ${hero.name} equipped ${item.name}${setTag}${hint}`,cls);
  }else{
    state.gold+=item.scrap;
    lootLog(`🪙 Scrapped ${item.name}${hint} for ${item.scrap}g`,'loot-r');
  }
}

function endWave(){
  clearInterval(state.tick); state.running=false;
  const p=alive(state.party).length, e=alive(state.enemies).length;
  if(p>0&&e===0){
    const firstClear=state.wave>state.highestWave;
    if(firstClear){
      const reward=12+state.wave*5; state.gold+=reward; state.highestWave=state.wave; state.talentPts += state.wave%5===0?3:0;
      state.stats.wavesCleared=(state.stats.wavesCleared||0)+1;
      state.stats.lastWaveMs=Date.now()-(state.stats.waveStartTs||Date.now());
      log(`✅ First clear Wave ${state.wave}! +${reward}g in ${(state.stats.lastWaveMs/1000).toFixed(1)}s`);
      while(state.nextHeroUnlockWave && state.highestWave>=state.nextHeroUnlockWave){
        openHeroUnlockChoice();
        state.nextHeroUnlockWave=null;
      }
      if(!$('heroUnlockModal').classList.contains('hidden')){
        save();
        draw();
        return;
      }
      if(state.mode==='push') state.wave=state.highestWave+1;
    }else{
      log(`♻️ Wave ${state.wave} replay cleared. Respawning for grind.`);
    }
    state.party.forEach(h=>{h.hp=Math.min(heroMaxHp(h), h.hp + Math.ceil(heroMaxHp(h)*0.2)); h.cd=0; h.focus=Math.max(0,(h.focus||0)-20);});
    state.enemies=[]; save(); draw();
    if(state.autoMode){
      // In grind mode, stay on the currently selected wave (do not snap backward unexpectedly).
      spawnWave(state.wave);
      startWave();
    }
    return;
  }
  if(p===0){
    const penalty=state.wave*5; state.gold=Math.max(0,state.gold-penalty);
    // Hard switch to grind after wipe to prevent push-mode deadlocks on failed progression.
    state.mode='grind';
    // Keep player near current progression instead of hard snapping backward.
    state.wave=Math.max(1,Math.min(state.wave||1,(state.highestWave||1)+1));
    state.combo=0;
    state.waveAtkStack=0;
    state.bossPending=false;
    log(`💀 Party wiped. -${penalty}g. Switched to GRIND at Wave ${state.wave}.`);
    state.party.forEach(h=>{h.alive=true;h.hp=Math.ceil(heroMaxHp(h)*0.92);h.cd=0;h.focus=0;h.secondWindUsed=false;});
    state.enemies=[];
    save();
    draw();
    if(state.autoMode){
      spawnWave(state.wave);
      startWave();
    }
    return;
  }
  save(); draw();
}

$('startBtn').onclick=()=>{ if(!state.running && state.mode==='grind' && state.wave>state.highestWave) state.wave=state.highestWave||1; startWave(); };
$('pauseBtn').onclick=()=>{ if(!state.running) return; state.paused=!state.paused; $('pauseBtn').textContent=state.paused?'Resume':'Pause'; };
$('speedBtn').onclick=()=>{ state.speed=state.speed===1?2:state.speed===2?3:1; loop(); draw(); save(); };
$('toggleTotalStatsBtn').onclick=()=>{ state.showTotalStats=!state.showTotalStats; draw(); save(); };
$('modeBtn').onclick=()=>{ 
  state.mode=state.mode==='push'?'grind':'push';
  if(!state.running){ state.enemies=[]; state.bossPending=false; }
  log(`Mode changed to ${state.mode.toUpperCase()}.`); 
  save(); 
  draw(); 
};
$('resetBtn').onclick=()=>{ localStorage.removeItem(SAVE_KEY); location.reload(); };
$('prevWaveBtn').onclick=()=>{
  const target=Math.max(1,state.wave-1);
  if(state.running){ log(`↩️ Jumping to Wave ${target}...`); jumpToWave(target); return; }
  state.wave=target; state.enemies=[]; state.bossPending=false; draw();
};
$('nextWaveBtn').onclick=()=>{
  const maxUnlocked=Math.max(1,state.highestWave+1);
  const target=Math.max(1,state.wave+1);
  if(target>maxUnlocked){
    log(`🔒 Wave ${target} is locked. Clear wave ${target-1} at least once first.`);
    return;
  }
  if(state.running){ log(`↪️ Jumping to Wave ${target}...`); jumpToWave(target); return; }
  state.wave=target; state.enemies=[]; state.bossPending=false; draw();
};

function buyBulk(costFn,apply){
  const target=state.shopBuyAmount;
  let buys=0;
  const maxBuys=(target==='max')?9999:target;
  for(let i=0;i<maxBuys;i++){
    const c=costFn();
    if(state.gold<c) break;
    state.gold-=c;
    apply(c);
    buys++;
  }
  return buys;
}

$('healBtn').onclick=()=>{
  const buys=buyBulk(healCost,()=>{ state.shopHealLv++; state.party.forEach(h=>{if(h.alive)h.hp=Math.min(heroMaxHp(h),h.hp+28)}); });
  if(!buys) return;
  log(`Party healed (${buys}x).`); save(); draw();
};
$('reviveBtn').onclick=()=>{ const anyKo=state.party.some(h=>!h.alive||h.hp<=0); if(!anyKo){ log('No KO ally to revive.'); return; } log(`Choose a KO ally below Revive (${reviveCost()}g).`); draw(); };
$('reviveTargets').onclick=(ev)=>{ const btn=ev.target.closest('button[data-revive]'); if(!btn) return; const c=reviveCost(); if(state.gold<c) return; const i=Number(btn.dataset.revive); const h=state.party[i]; if(!h||h.alive&&h.hp>0) return; state.gold-=c; state.shopReviveLv++; h.alive=true; h.cd=0; h.hp=Math.ceil(heroMaxHp(h)*0.45); log(`✨ Revived ${h.name} (-${c}g)`); save(); draw(); };
$('atkBtn').onclick=()=>{ const buys=buyBulk(atkCost,()=>{ state.shopAtkLv++; state.teamBuffAtk+=2; }); if(!buys) return; log(`Team ATK +${buys*2}`); save(); draw(); };
$('hpBtn').onclick=()=>{ const buys=buyBulk(hpCost,()=>{ state.shopHpLv++; state.teamBuffHp+=10; state.party.forEach(h=>h.hp=Math.min(heroMaxHp(h),h.hp+10)); }); if(!buys) return; log(`Team Max HP +${buys*10}`); save(); draw(); };
$('critBtn').onclick=()=>{ const buys=buyBulk(critCost,()=>{ state.shopCritLv++; state.teamBuffCrit+=0.01; }); if(!buys) return; log(`Team Crit +${buys}%`); save(); draw(); };
$('critDmgBtn').onclick=()=>{ const buys=buyBulk(critDmgCost,()=>{ state.shopCritDmgLv++; state.teamBuffCritDmg+=0.05; }); if(!buys) return; log(`Team Crit Damage +${buys*5}%`); save(); draw(); };
$('defBtn').onclick=()=>{ const buys=buyBulk(defCost,()=>{ state.shopDefLv++; state.teamBuffDef+=1; }); if(!buys) return; log(`Team Defense +${buys}`); save(); draw(); };

function buyTalent(key,label){ if(state.talentPts<TALENT_COST||state.talents[key]) return; state.talentPts-=TALENT_COST; state.talents[key]=true; log(`🧠 Talent unlocked: ${label}`); save(); draw(); }
$('talSecondWind').onclick=()=>buyTalent('secondWind','Second Wind');
$('talBloodlust').onclick=()=>buyTalent('bloodlust','Bloodlust');
$('talEcho').onclick=()=>buyTalent('echo','Arcane Echo');
$('talTreasure').onclick=()=>buyTalent('treasure','Treasure Hunter');
$('talRhythm').onclick=()=>buyTalent('battleRhythm','Battle Rhythm');
$('talSlayer').onclick=()=>buyTalent('giantSlayer','Giant Slayer');
$('talAtkPct').onclick=()=>{
  const lv=state.talents.atkPctLv||0;
  if(lv>=5 || state.talentPts<TALENT_COST) return;
  state.talentPts-=TALENT_COST;
  state.talents.atkPctLv=lv+1;
  log(`🧠 Might Training upgraded to rank ${state.talents.atkPctLv} (+${TALENT_PCT_TIERS[lv]}% ATK).`);
  save(); draw();
};
$('talHpPct').onclick=()=>{
  const lv=state.talents.hpPctLv||0;
  if(lv>=5 || state.talentPts<TALENT_COST) return;
  state.talentPts-=TALENT_COST;
  state.talents.hpPctLv=lv+1;
  state.party.forEach(h=>h.hp=Math.min(heroMaxHp(h),h.hp+12));
  log(`🧠 Fortitude Training upgraded to rank ${state.talents.hpPctLv} (+${TALENT_PCT_TIERS[lv]}% HP).`);
  save(); draw();
};

$('buyAmt1').onclick=()=>{ state.shopBuyAmount=1; draw(); };
$('buyAmt5').onclick=()=>{ state.shopBuyAmount=5; draw(); };
$('buyAmt10').onclick=()=>{ state.shopBuyAmount=10; draw(); };
$('buyAmtMAX').onclick=()=>{ state.shopBuyAmount='max'; draw(); };

$('heroUnlockChoices').onclick=(ev)=>{
  const b=ev.target.closest('button[data-unlock-hero]');
  if(!b) return;
  unlockHeroByChoice(b.dataset.unlockHero);
};
$('heroUnlockContinueBtn').onclick=()=>{
  if(state.pendingHeroUnlock) return;
  $('heroUnlockModal').classList.add('hidden');
  if(state.mode==='push') state.wave=state.highestWave+1;
  save();
  draw();
  if(state.autoMode && !state.running){
    spawnWave(state.wave);
    startWave();
  }
};

$('party').onclick=(ev)=>{
  const btn=ev.target.closest('button[data-class]'); if(!btn) return;
  const i=Number(btn.dataset.i), h=state.party[i]; if(!h||h.advClass) return;
  h.advClass=btn.dataset.class; log(`⚔️ ${h.name} advanced to ${h.advClass}`); save(); draw();
};
$('equipHeroList').onclick=(ev)=>{ const b=ev.target.closest('button[data-ehero]'); if(!b) return; state.equipHeroIdx=Number(b.dataset.ehero); drawEquipUI(); };
$('skillBar').onclick=(ev)=>{ const b=ev.target.closest('button[data-skill]'); if(!b) return; castHeroSkill(Number(b.dataset.skill)); save(); };

function normalizeLoadedState(){
  state.party=state.party.map(h=>{
    if(!h.equip){ const e={}; SLOTS.forEach(s=>e[s]=null); h.equip=e; }
    if(h.lvl==null) h.lvl=1; if(h.xp==null) h.xp=0; if(!h.advClass) h.advClass=null;
    if(h.secondWindUsed==null) h.secondWindUsed=false;
    if(h.abilityCd==null) h.abilityCd=0; if(h.tempShield==null) h.tempShield=0;
    if(h.focus==null) h.focus=0;
    recomputeGearStats(h);
    h.hp=Math.min(h.hp||heroMaxHp(h),heroMaxHp(h));
    h.alive=h.hp>0;
    return h;
  });
  if(!state.talents) state.talents={secondWind:false,bloodlust:false,echo:false,treasure:false,battleRhythm:false,giantSlayer:false,atkPctLv:0,hpPctLv:0};
  if(state.talents.battleRhythm==null) state.talents.battleRhythm=false;
  if(state.talents.giantSlayer==null) state.talents.giantSlayer=false;
  if(state.talents.atkPctLv==null) state.talents.atkPctLv=0;
  if(state.talents.hpPctLv==null) state.talents.hpPctLv=0;
  if(state.shopCritLv==null) state.shopCritLv=0;
  if(state.shopCritDmgLv==null) state.shopCritDmgLv=0;
  if(state.shopDefLv==null) state.shopDefLv=0;
  if(state.teamBuffCrit==null) state.teamBuffCrit=0;
  if(state.teamBuffCritDmg==null) state.teamBuffCritDmg=0;
  if(state.teamBuffDef==null) state.teamBuffDef=0;
  if(state.shopBuyAmount==null) state.shopBuyAmount=1;
  if(state.pendingHeroUnlock==null) state.pendingHeroUnlock=false;
  if(state.showTotalStats==null) state.showTotalStats=true;
  if(!state.mode) state.mode='push';
  if(state.combo==null) state.combo=0;
  if(!state.highestWave && state.wave>1) state.highestWave=state.wave-1;
  state.wave=Math.max(1,state.wave||1);
  if(!state.stats) state.stats={waveKills:0,dmgDealt:0,dmgTaken:0,wavesCleared:0,lastWaveMs:0,waveStartTs:Date.now()};
  if(!state.watchdog) state.watchdog={noChangeTicks:0,lastTotalHp:0};
  state.stats.waveStartTs=state.stats.waveStartTs||Date.now();
  state.unlockedSlots=Math.max(1,Math.min(3,state.party.length||1));
  if(state.nextHeroUnlockWave==null) state.nextHeroUnlockWave=state.unlockedSlots===1?20:state.unlockedSlots===2?50:null;
}

function startNewGame(playerName,startClass){
  const hero=heroTemplate(startClass||'Warrior');
  state.playerName=(playerName||'Commander').trim()||'Commander';
  state.wave=1; state.highestWave=0; state.gold=0; state.wins=0; state.running=false; state.paused=false;
  state.talentPts=0; state.waveAtkStack=0; state.combo=0;
  state.shopHealLv=0; state.shopReviveLv=0; state.shopAtkLv=0; state.shopHpLv=0; state.shopCritLv=0; state.shopCritDmgLv=0; state.shopDefLv=0;
  state.teamBuffAtk=0; state.teamBuffHp=0; state.teamBuffCrit=0; state.teamBuffCritDmg=0; state.teamBuffDef=0;
  state.talents={secondWind:false,bloodlust:false,echo:false,treasure:false,battleRhythm:false,giantSlayer:false,atkPctLv:0,hpPctLv:0};
  state.party=[hero];
  state.unlockedSlots=1;
  state.nextHeroUnlockWave=20;
  state.pendingHeroUnlock=false;
  state.showTotalStats=true;
  state.enemies=[];
  state.stats={waveKills:0,dmgDealt:0,dmgTaken:0,wavesCleared:0,lastWaveMs:0,waveStartTs:Date.now()};
  state.watchdog={noChangeTicks:0,lastTotalHp:0};
  save();
  draw();
  log(`Welcome, ${state.playerName}. ${startClass} leads the run!`);
}

const hasSave=load();
if(hasSave) normalizeLoadedState();

if(!hasSave){
  $('newGameModal').classList.remove('hidden');
  $('startNewGameBtn').onclick=()=>{
    const name=$('playerNameInput').value;
    const cls=$('startClassSelect').value;
    startNewGame(name,cls);
    $('newGameModal').classList.add('hidden');
  };
}else{
  draw();
  log('v1.3 ready. Hero unlock choice popups, progression tuning, expanded talents, and bulk shop upgrades.');
}