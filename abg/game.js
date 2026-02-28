const SAVE_KEY='abg_v08_save';
const SLOTS=['weapon','offhand','helm','shoulders','chest','gloves','boots','ring1','ring2','amulet','belt'];
const SETS=['Vanguard','Wildheart','Astral'];

const state={
  wave:1,highestWave:0,gold:0,wins:0,running:false,paused:false,tick:null,speed:1,
  autoMode:true,mode:'push',
  partyTalentPts:0,
  partyTalents:{treasureHunter:false,warBannerLv:0,ironWallLv:0,battleMedicLv:0,furyDrumsLv:0},
  stats:{waveKills:0,dmgDealt:0,dmgTaken:0,wavesCleared:0,lastWaveMs:0,waveStartTs:0},
  watchdog:{noChangeTicks:0,lastTotalHp:0},
  waveAtkStack:0,
  playerName:'Commander',
  party:[mkHero('Warrior','assets/warrior-human.svg',78,11,'block')],
  unlockedSlots:1,
  nextHeroUnlockWave:50,
  pendingHeroUnlock:false,
  enemies:[],equipHeroIdx:0,upgradeHeroIdx:0,talentHeroIdx:0,shopBuyAmount:1,statsView:'total',autoSkillCast:true
};

function mkHero(name,icon,hp,atk,skill){
  const equip={}; SLOTS.forEach(s=>equip[s]=null);
  return {name,icon,maxHp:hp,hp,atk,alive:true,skill,cd:0,abilityCd:0,tempShield:0,gearAtk:0,gearHp:0,gearCrit:0,lvl:1,xp:0,talentPts:0,advClass:null,equip,secondWindUsed:false,mana:0,setAtk:0,setHp:0,setCrit:0,setArmor:0,setSkillMult:0,setCdr:0,setLeech:0,upAtkLv:0,upHpLv:0,upManaLv:0,upCritLv:0,upCritDmgLv:0,upDefLv:0,upAtk:0,upHp:0,upMana:0,upCrit:0,upCritDmg:0,upDef:0,talents:{secondWind:false,bloodlust:false,echo:false,battleRhythm:false,giantSlayer:false,atkPctLv:0,hpPctLv:0,adv1:false,adv2:false,adv3:false}};
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
  state.nextHeroUnlockWave=state.unlockedSlots===2?100:null;
  state.pendingHeroUnlock=false;
  $('heroUnlockContinueBtn').disabled=false;
  log(`🧭 Reinforcement joined: ${heroClass} at Lv ${newHero.lvl}! Party slots: ${state.unlockedSlots}/3`);
  save();
  draw();
}

function mkEnemy(i,w,boss=false){
  const icons=['assets/monster-goblin.svg','assets/monster-wolf.svg','assets/monster-ogre.svg'];
  const lateScale=1+Math.max(0,w-8)*0.04;
  const expectedSlots=w>=100?3:w>=50?2:1;
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
const fmtNum=n=>Math.round(n).toLocaleString();

function pickEnemyTarget(){
  const enemies=state.enemies.filter(e=>e && e.alive && Number.isFinite(e.hp) && Number.isFinite(e.maxHp) && e.hp>0 && e.maxHp>0);
  if(!enemies.length) return null;

  // If marked targets exist, still prioritize them.
  const marked=enemies.filter(e=>(e.markedTurns||0)>0);
  if(marked.length) return marked.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];

  // Hybrid targeting: mostly prioritize weakest, sometimes spread pressure.
  const sorted=[...enemies].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));
  const prioritizeWeakest=Math.random()<0.7;
  if(prioritizeWeakest) return sorted[0];

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
const heroUpCost=(h,key)=>{
  const defs={upAtkLv:[14,9],upHpLv:[14,9],upManaLv:[15,9],upCritLv:[18,11],upCritDmgLv:[20,12],upDefLv:[16,10]};
  const [base,step]=defs[key];
  return costByLevel(base,step,h[key]||0);
};
const TALENT_COST=5;
const TALENT_PCT_TIERS=[5,10,15,20,25];
const TEAM_TALENT_COST=5;
function teamTalentMeta(){
  return {
    treasureHunter:{name:'Treasure Hunter',type:'single',short:'More gold + better drops for whole team.',detail:'+25% gold from all kills and +25% item drop chance.'},
    warBannerLv:{name:'War Banner',type:'rank',max:5,short:'Team ATK scales up each rank.',detail:'+4% team ATK per rank (max +20%).'},
    ironWallLv:{name:'Iron Wall',type:'rank',max:5,short:'Team damage reduction scaling.',detail:'+1 flat defense per hero per rank (max +5).'},
    battleMedicLv:{name:'Battle Medic',type:'rank',max:5,short:'More post-wave recovery.',detail:'+3% extra heal after wave clear per rank.'},
    furyDrumsLv:{name:'Fury Drums',type:'rank',max:5,short:'Faster skill cycling for everyone.',detail:'Each rank gives 10% chance per tick to reduce own skill CD by 1.'}
  };
}

function xpToNext(h){ return 20 + (h.lvl-1)*12; }
function heroCrit(h){ return (h.skill==='crit'?0.2:0.08) + h.gearCrit + h.setCrit + (h.upCrit||0) + (h.advClass==='Sniper'?0.12:0) + ((h.talents?.adv1 && h.advClass==='Sniper')?0.06:0) + h.mana*0.001; }
function heroAtk(h){
  let v=h.atk+(h.upAtk||0)+h.gearAtk+h.setAtk+state.waveAtkStack;
  const atkPct=TALENT_PCT_TIERS.slice(0,h.talents?.atkPctLv||0).reduce((s,x)=>s+x,0)/100;
  v=Math.floor(v*(1+atkPct));
  if(h.advClass==='Berserker' && h.hp/heroMaxHp(h)<0.45) v+=Math.ceil(v*0.22);
  if(h.talents?.adv1 && h.advClass==='Berserker' && h.hp/heroMaxHp(h)<0.45) v+=Math.ceil(v*0.12);
  if(h.talents?.adv2 && (h.advClass==='Paladin' || h.advClass==='Warlock')) v+=Math.ceil(v*0.08);
  if(h.advClass==='Warlock') v+=2;
  if(h.mana>=80) v+=2;
  const bannerMult=1+((state.partyTalents.warBannerLv||0)*0.04);
  return Math.floor(v*bannerMult);
}
function heroMaxHp(h){
  let v=h.maxHp+(h.upHp||0)+h.gearHp+h.setHp;
  const hpPct=TALENT_PCT_TIERS.slice(0,h.talents?.hpPctLv||0).reduce((s,x)=>s+x,0)/100;
  v=Math.floor(v*(1+hpPct));
  if(h.advClass==='Paladin') v+=16;
  if(h.advClass==='Warden') v+=10;
  if(h.talents?.adv1 && h.advClass==='Warden') v+=Math.ceil(v*0.12);
  return v;
}
function heroManaMax(h){ return 100 + (h.upMana||0); }
function enemyArmor(e){ return Math.max(0,e.armor||0); }
function dealDamageToEnemy(attacker,enemy,raw){
  let dmg=Math.max(1,Math.floor(raw));
  if(enemy.markedTurns>0) dmg=Math.floor(dmg*(1+enemy.markedAmp));
  if(attacker.talents?.giantSlayer && (enemy.boss||enemy.elite)) dmg=Math.floor(dmg*1.18);
  if(attacker.talents?.adv2 && (attacker.advClass==='Berserker' || attacker.advClass==='Warlock') && (enemy.boss||enemy.elite)) dmg=Math.floor(dmg*1.1);
  dmg=Math.max(1,dmg-enemyArmor(enemy));
  enemy.hp-=dmg;
  state.stats.dmgDealt=(state.stats.dmgDealt||0)+dmg;
  const eid=state.enemies.indexOf(enemy);
  if(eid>=0) floatText(`e${eid}`,`-${dmg}`);
  if(attacker.setLeech>0) attacker.hp=Math.min(heroMaxHp(attacker),attacker.hp+Math.ceil(dmg*attacker.setLeech));
  if(attacker.talents?.adv1 && attacker.advClass==='Warlock') attacker.hp=Math.min(heroMaxHp(attacker),attacker.hp+Math.ceil(dmg*0.06));
  if(attacker.talents?.adv3 && attacker.advClass==='Berserker') attacker.hp=Math.min(heroMaxHp(attacker),attacker.hp+Math.ceil(dmg*0.04));
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
        ${isParty?`<small>Lv ${u.lvl} • XP ${u.xp}/${xpToNext(u)} • TalPts ${u.talentPts||0} • ATK ${heroAtk(u)} • Mana ${Math.floor(u.mana||0)}/${heroManaMax(u)} • Skill CD ${u.abilityCd||0}${u.tempShield?` • Shield ${u.tempShield}`:''}</small>`:`<small>ATK ${u.atk} • Armor ${enemyArmor(u)}${u.markedTurns>0?` • Marked ${u.markedTurns}`:''}${u.affix?` • ${u.affix}`:''}</small>`}
      </div>
      ${isParty?`<div class='mini-actions'><button data-open-tal='${arr.indexOf(u)}' class='buyamt'>Talents</button><button data-skill-hero='${arr.indexOf(u)}' class='buyamt' ${(!u.alive||u.abilityCd>0||!state.enemies.length)?'disabled':''} title='${skillTooltip(u)}'>${skillName(u)} ${u.abilityCd>0?`(${u.abilityCd})`:''}</button></div>`:''}
      <div>${isParty?'':(u.healer?'🪄':u.affix==='Frenzied'?'🔥':u.affix==='Bastion'?'🧱':u.affix==='Vampiric'?'🩸':'⚔️')}</div>
    </div>`).join('');
}
function drawBattlefield(){
  $('partyLane').innerHTML=state.party.map((u,i)=>`<div class='sprite ${u.alive?'':'dead'}' id='p${i}'><img src='${u.icon}' alt=''></div>`).join('');
  $('enemyLane').innerHTML=state.enemies.map((u,i)=>`<div class='sprite enemy ${u.alive?'':'dead'}' id='e${i}'><img src='${u.icon}' alt=''></div>`).join('');
}
function previewHeroBulkCost(hero,lvKey){
  const target=state.shopBuyAmount;
  const maxBuys=(target==='max')?9999:target;
  let gold=state.gold, buys=0, total=0;
  let lv=hero[lvKey]||0;
  const defs={upAtkLv:[14,9],upHpLv:[14,9],upManaLv:[15,9],upCritLv:[18,11],upCritDmgLv:[20,12],upDefLv:[16,10]};
  const [base,step]=defs[lvKey];
  for(let i=0;i<maxBuys;i++){
    const c=costByLevel(base,step,lv);
    if(gold<c) break;
    gold-=c;
    total+=c;
    buys++;
    lv++;
  }
  return {buys,total};
}

function drawUpgradeUI(){
  $('upgradeHeroList').innerHTML=state.party.map((h,i)=>`<button class='hero-pill ${i===state.upgradeHeroIdx?'active':''}' data-uphero='${i}'>${h.name} Lv${h.lvl}</button>`).join('');
  const h=state.party[state.upgradeHeroIdx]||state.party[0];
  if(!h) return;
  const left=[
    ['Hero',`${h.name} • Level: ${h.lvl}`],
    ['HP rank',`${h.upHpLv||0}`],
    ['Def rank',`${h.upDefLv||0}`],
    ['Mana rank',`${h.upManaLv||0}`],
    ['ATK rank',`${h.upAtkLv||0}`],
    ['Crit rank',`${h.upCritLv||0}`],
    ['CritDmg rank',`${h.upCritDmgLv||0}`]
  ];
  const right=[
    ['Total Max HP',`${heroMaxHp(h)}`],
    ['Total Defense',`${h.upDef||0}`],
    ['Mana',`${Math.floor(h.mana||0)}/${heroManaMax(h)}`],
    ['Total ATK',`${heroAtk(h)}`],
    ['Total Crit',`${(heroCrit(h)*100).toFixed(1)}%`],
    ['Total Crit Dmg Bonus',`${Math.round((h.upCritDmg||0)*100)}%`],
    ['ATK/HP breakdown',`${h.atk}+${h.upAtk||0}+${h.gearAtk||0} / ${h.maxHp}+${h.upHp||0}+${h.gearHp||0}`]
  ];
  $('upgradeInfo').innerHTML=`<div class='upgrade-split'><div class='upgrade-col'>${left.map(([k,v])=>`<div class='stat-row'><span>${k}</span><span>${v}</span></div>`).join('')}</div><div class='upgrade-col'>${right.map(([k,v])=>`<div class='stat-row'><span>${k}</span><span>${v}</span></div>`).join('')}</div></div>`;
  const pAtk=previewHeroBulkCost(h,'upAtkLv'), pHp=previewHeroBulkCost(h,'upHpLv'), pMana=previewHeroBulkCost(h,'upManaLv'), pCrit=previewHeroBulkCost(h,'upCritLv'), pCd=previewHeroBulkCost(h,'upCritDmgLv'), pDef=previewHeroBulkCost(h,'upDefLv');
  $('upAtkBtn').textContent=`+2 ATK x${pAtk.buys} (${pAtk.total}g)`;
  $('upHpBtn').textContent=`+12 Max HP x${pHp.buys} (${pHp.total}g)`;
  $('upManaBtn').textContent=`+10 Max Mana x${pMana.buys} (${pMana.total}g)`;
  $('upCritBtn').textContent=`+1% Crit x${pCrit.buys} (${pCrit.total}g)`;
  $('upCritDmgBtn').textContent=`+5% Crit Dmg x${pCd.buys} (${pCd.total}g)`;
  $('upDefBtn').textContent=`+1 Defense x${pDef.buys} (${pDef.total}g)`;
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
  if(h.advClass==='Paladin') return 'Guardian Oath';
  if(h.advClass==='Berserker') return 'Rage Slam';
  if(h.advClass==='Sniper') return 'Deadeye Volley';
  if(h.advClass==='Warden') return 'Thorn Volley';
  if(h.advClass==='Sorcerer') return 'Tempest Nova';
  if(h.advClass==='Warlock') return 'Soul Drain';
  if(h.name==='Warrior') return 'Guardian Cry';
  if(h.name==='Ranger') return 'Volley';
  return 'Arcane Nova';
}
function skillTooltip(h){
  if(h.advClass==='Paladin') return 'Guardian Oath: Team shield + team heal (5, empowered 8). CD 8. Empowered at 50 mana.';
  if(h.advClass==='Berserker') return 'Rage Slam: Team shield + single heavy strike (125% ATK). CD 8. Empowered at 50 mana.';
  if(h.advClass==='Sniper') return 'Deadeye Volley: Hits all enemies, applies mark amp 32% (+8% with Pinpoint). CD 8.';
  if(h.advClass==='Warden') return 'Thorn Volley: Hits all enemies, applies marks, grants team shield (3, empowered 5). CD 8.';
  if(h.advClass==='Sorcerer') return 'Tempest Nova: Main hit + chain splash (1/2 extra targets). CD 8. Skill scaling boosted by Overcharge.';
  if(h.advClass==='Warlock') return 'Soul Drain: Heavy single-target spell, self-heal 10 (empowered 16). CD 8.';
  if(h.name==='Warrior') return 'Guardian Cry: Team shield skill. CD 8. Empowered at 50 mana.';
  if(h.name==='Ranger') return 'Volley: Multi-target ranged strike with mark setup. CD 8.';
  return 'Arcane Nova: Spell burst attack. CD 8.';
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

function renderBattleStats(){
  const s=state.stats;
  const secs=Math.max(0,Math.round((Date.now()-(s.waveStartTs||Date.now()))/1000));
  return [
    ['Wave kills', fmtNum(s.waveKills||0)],
    ['Damage dealt', fmtNum(s.dmgDealt||0)],
    ['Damage taken', fmtNum(s.dmgTaken||0)],
    ['Waves cleared', fmtNum(s.wavesCleared||0)],
    ['Current wave time', `${secs}s`],
    ['Last clear time', s.lastWaveMs?`${(s.lastWaveMs/1000).toFixed(1)}s`:'—']
  ];
}

function renderTotalStats(){
  const partyLvTotal=state.party.reduce((s,h)=>s+(h.lvl||1),0);
  const avgLv=state.party.length?partyLvTotal/state.party.length:1;
  const totalAtk=state.party.reduce((s,h)=>s+heroAtk(h),0);
  const totalMaxHp=state.party.reduce((s,h)=>s+heroMaxHp(h),0);
  const totalCrit=state.party.reduce((s,h)=>s+heroCrit(h),0);
  const avgCrit=state.party.length?totalCrit/state.party.length:0;
  const totalDef=state.party.reduce((s,h)=>s+(h.upDef||0),0);
  const avgCritDmg=state.party.length?state.party.reduce((s,h)=>s+(h.upCritDmg||0),0)/state.party.length:0;
  return [
    ['Party size', `${state.party.length}/3`],
    ['Total party level', fmtNum(partyLvTotal)],
    ['Average party level', avgLv.toFixed(1)],
    ['Combined ATK', fmtNum(totalAtk)],
    ['Combined Max HP', fmtNum(totalMaxHp)],
    ['Average Crit', `${(avgCrit*100).toFixed(1)}%`],
    ['Total Defense', fmtNum(totalDef)],
    ['Avg Crit Dmg Bonus', `${Math.round(avgCritDmg*100)}%`]
  ];
}

function drawStatsPanel(){
  const rows=state.statsView==='battle'?renderBattleStats():renderTotalStats();
  $('statsViewTotal').classList.toggle('active',state.statsView==='total');
  $('statsViewBattle').classList.toggle('active',state.statsView==='battle');
  $('totalStats').innerHTML=rows.map(([k,v])=>`<div class='stat-row'><span>${k}</span><span>${v}</span></div>`).join('');
}

function draw(){
  $('wave').textContent=state.wave; $('highestWave').textContent=state.highestWave; $('gold').textContent=state.gold; $('wins').textContent=state.wins;
  $('speedLabel').textContent=`${state.speed}x`;
  $('modeBtn').textContent=`Mode: ${state.mode==='push'?'Push':'Grind'}`;
  $('teamTalentsBtn').textContent=`Team Talents (${state.partyTalentPts||0})`;
  $('autoSkillBtn').textContent=`Auto Skill: ${state.autoSkillCast?'ON':'OFF'}`;
  $('vsLabel').textContent=state.wave%5===0?'BOSS':'AUTO';
  $('startBtn').textContent=state.running?'In Combat':'Start / Resume';
  $('pauseBtn').textContent=state.paused?'Resume':'Pause';
  [1,5,10,'max'].forEach(v=>{ const el=$(`buyAmt${String(v).toUpperCase()}`); if(el) el.classList.toggle('active',state.shopBuyAmount===v); });
  drawList('party',state.party,true); drawList('enemies',state.enemies,false); drawBattlefield();
  drawUpgradeUI(); drawClassChoices(); drawEquipUI(); drawStatsPanel();
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
function gainMana(h,amount){ h.mana=clamp((h.mana||0)+amount,0,heroManaMax(h)); }

function onEnemyKilled(enemy,killer){
  state.stats.waveKills=(state.stats.waveKills||0)+1;
  const partyGoldMult=state.partyTalents.treasureHunter?1.25:1;
  const goldGain=Math.max(1,Math.round(enemy.gold*partyGoldMult));
  state.gold+=goldGain; state.wins++; log(`💰 ${enemy.name} dropped ${goldGain}g`);
  gainXp(killer,enemy.xp);
  gainMana(killer,12);
  if(killer.talents?.bloodlust){ state.waveAtkStack=Math.min(10,state.waveAtkStack+1); }
  if(killer.talents?.battleRhythm){ state.party.forEach(h=>{ if(h.alive&&h.abilityCd>0) h.abilityCd=Math.max(0,h.abilityCd-1); }); }
  maybeDropItem(enemy);
}

function castHeroSkill(i){
  const h=state.party[i];
  if(!h||!h.alive||h.abilityCd>0||!alive(state.enemies).length) return;
  const empowered=(h.mana||0)>=50;
  if(empowered) h.mana=Math.max(0,h.mana-50);
  const setMult=1+(h.setSkillMult||0)+(empowered?0.2:0)+((h.talents?.adv1 && h.advClass==='Sorcerer')?0.1:0);
  if(h.name==='Warrior'){
    const isB=h.advClass==='Berserker';
    const shield=Math.floor((isB?8:14) * (empowered?1.35:1));
    state.party.forEach(p=>{ if(p.alive) p.tempShield=(p.tempShield||0)+shield; });
    if(isB){
      const t=pick(state.enemies); if(t){ dealDamageToEnemy(h,t,heroAtk(h)*1.25*setMult); vfxAt(`e${state.enemies.indexOf(t)}`,'crit'); }
    }else if(h.advClass==='Paladin'){
      state.party.forEach(p=>{ if(p.alive) p.hp=Math.min(heroMaxHp(p),p.hp+(empowered?8:5)); });
    }
    log(`🛡️ ${h.name} used ${skillName(h)}${empowered?' (Empowered)':''}.`);
  }else if(h.name==='Ranger'){
    const isS=h.advClass==='Sniper', isW=h.advClass==='Warden';
    const mult=(isS?0.95:isW?0.78:0.7)*setMult;
    alive(state.enemies).forEach(t=>{ dealDamageToEnemy(h,t,heroAtk(h)*mult); t.markedTurns=2; t.markedAmp=(isS?0.32:isW?0.24:0.2) + ((h.talents?.adv3&&isS)?0.08:0); vfxAt(`e${state.enemies.indexOf(t)}`,'slash'); });
    if(isW) state.party.forEach(p=>{ if(p.alive) p.tempShield=(p.tempShield||0)+(empowered?5:3); });
    log(`🏹 ${h.name} used ${skillName(h)}${empowered?' (Empowered)':''}.`);
  }else{
    const t=pick(state.enemies); if(!t) return;
    const isWl=h.advClass==='Warlock', isSorc=h.advClass==='Sorcerer';
    const mult=(isWl?1.8:isSorc?1.55:1.4)*setMult;
    dealDamageToEnemy(h,t,heroAtk(h)*mult); vfxAt(`e${state.enemies.indexOf(t)}`,'burst');
    if(isWl) h.hp=Math.min(heroMaxHp(h),h.hp+(empowered?16:10));
    if(isSorc){ const spl=alive(state.enemies).filter(x=>x!==t).slice(0,empowered?2:1); spl.forEach(x=>{ dealDamageToEnemy(h,x,heroAtk(h)*0.6*setMult); vfxAt(`e${state.enemies.indexOf(x)}`,'burst'); }); }
    log(`✨ ${h.name} cast ${skillName(h)}${empowered?' (Empowered)':''}.`);
  }
  h.abilityCd=8;
  draw();
}

function heroAttack(a,b){
  let dmg=heroAtk(a);
  const critChance=heroCrit(a);
  if(Math.random()<critChance){
    const critMult=(a.advClass==='Sniper'?2.1:1.75)*(1+(a.upCritDmg||0)+((a.talents?.adv2 && a.advClass==='Sniper')?0.15:0));
    dmg=Math.floor(dmg*critMult);
    log(`💥 ${a.name} crit!`); vfxAt(`e${state.enemies.indexOf(b)}`,'crit');
  }
  if(a.skill==='burst' && a.cd<=0){
    const targets=alive(state.enemies).slice(0,a.advClass==='Sorcerer'?3:2);
    targets.forEach(x=>{ dealDamageToEnemy(a,x,dmg*0.72); vfxAt(`e${state.enemies.indexOf(x)}`,'burst'); });
    a.cd=4;
    gainMana(a,10);
    return;
  }
  dealDamageToEnemy(a,b,dmg); vfxAt(`e${state.enemies.indexOf(b)}`,'slash');
  if(a.name==='Ranger'){ b.markedTurns=2; b.markedAmp=(a.advClass==='Sniper'?0.3:0.16) + ((a.talents?.adv3&&a.advClass==='Sniper')?0.08:0); }
  if(a.advClass==='Paladin'){ const t=alive(state.party).sort((x,y)=>x.hp/heroMaxHp(x)-y.hp/heroMaxHp(y))[0]; if(t){ t.hp=Math.min(heroMaxHp(t),t.hp+4); } if(a.talents?.adv3){ a.hp=Math.min(heroMaxHp(a),a.hp+2); } }
  if(a.advClass==='Warlock'){ a.hp=Math.min(heroMaxHp(a),a.hp+2); }
  const echoChance=(a.talents?.echo?0.15:0) + ((a.talents?.adv2 && a.advClass==='Sorcerer')?0.1:0);
  if(echoChance>0 && Math.random()<echoChance && b.alive){ dealDamageToEnemy(a,b,dmg*0.4); vfxAt(`e${state.enemies.indexOf(b)}`,'burst'); }
  gainMana(a,8);
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
  const classDef=(d.talents?.adv2 && d.advClass==='Warden')?1:0;
  const teamDef=(state.partyTalents.ironWallLv||0);
  dmg=Math.max(1,dmg-(d.setArmor||0)-(d.upDef||0)-classDef-teamDef);
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
  gainMana(d,6);
  if(d.hp<=0&&d.alive){
    if(d.talents?.secondWind && !d.secondWindUsed){ d.secondWindUsed=true; const ratio=(d.talents?.adv3 && d.advClass==='Warden')?0.45:0.3; d.hp=Math.ceil(heroMaxHp(d)*ratio); log(`🪽 ${d.name} triggered Second Wind!`); return; }
    d.alive=false; log(`${c.name} downed ${d.name}.`);
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

  if(state.autoSkillCast){
    const ready=state.party.map((h,i)=>({h,i})).filter(x=>x.h.alive && x.h.abilityCd<=0 && alive(state.enemies).length>0);
    if(ready.length){
      ready.sort((a,b)=>(b.h.mana||0)-(a.h.mana||0));
      castHeroSkill(ready[0].i);
    }
  }

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
    const extraCdr=(h.talents?.adv3 && h.advClass==='Sorcerer')?1:0;
    if(h.abilityCd>0) h.abilityCd=Math.max(0,h.abilityCd-1-(h.setCdr||0)-extraCdr);
    if(h.abilityCd>0 && Math.random()<((state.partyTalents.furyDrumsLv||0)*0.1)) h.abilityCd=Math.max(0,h.abilityCd-1);
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
    if(hero.lvl%3===0) hero.talentPts=(hero.talentPts||0)+2;
  }
}
function advancedOptions(name){
  if(name==='Warrior') return ['Paladin','Berserker'];
  if(name==='Ranger') return ['Sniper','Warden'];
  return ['Sorcerer','Warlock'];
}
function advTalentNames(cls){
  const m={
    Paladin:['Bulwark (+1 def)','Zeal (+8% atk)','Beacon (+2 self-heal/hit)'],
    Berserker:['Ruin (+12% low-hp atk)','Executioner (+10% vs elites/boss)','Bloodguard (+4% leech)'],
    Sniper:['Sharpshot (+6% crit)','Headhunter (+15% crit dmg)','Pinpoint (+8% marked dmg)'],
    Warden:['Ironhide (+12% hp)','Aegis (+1 def)','Safeguard (stronger 2nd wind)'],
    Sorcerer:['Overcharge (+10% skill dmg)','Chainspark (+10% echo chance)','Timewarp (+1 CDR)'],
    Warlock:['Soul Siphon (+6% leech)','Doom (+10% vs elites/boss)','Dark Pact (+8% atk)']
  };
  return m[cls]||['—','—','—'];
}
function talentMeta(key){
  const m={
    secondWind:{name:'Second Wind',short:'Survive one lethal hit each wave.',detail:'Once per wave, this hero survives a lethal hit and returns at 30% max HP (45% for Warden with Safeguard).'},
    bloodlust:{name:'Bloodlust',short:'+1 stacking wave ATK on this hero kills.',detail:'When this hero gets a kill, team gains +1 wave ATK stack (max +10) until wave ends.'},
    echo:{name:'Arcane Echo',short:'Chance to trigger bonus echo hit.',detail:'Gives 15% chance for an extra hit dealing 40% damage. Sorcerer Chainspark adds +10% echo chance.'},

    battleRhythm:{name:'Battle Rhythm',short:'Kills reduce team skill cooldowns.',detail:'On this hero kill, all living allies reduce active skill cooldown by 1 turn.'},
    giantSlayer:{name:'Giant Slayer',short:'Bonus damage vs elites and bosses.',detail:'This hero deals +18% damage vs elite and boss enemies.'},
    atkPctLv:{name:'Might Training',short:'Permanent attack scaling.',detail:'+5/+10/+15/+20/+25% ATK across ranks 1-5 for this hero.'},
    hpPctLv:{name:'Fortitude Training',short:'Permanent max HP scaling.',detail:'+5/+10/+15/+20/+25% Max HP across ranks 1-5 for this hero.'},
    adv1:{name:'Class Node I',short:'Class-specific passive #1.',detail:'First advanced-class passive node. Exact effect depends on chosen class.'},
    adv2:{name:'Class Node II',short:'Class-specific passive #2.',detail:'Second advanced-class passive node. Exact effect depends on chosen class.'},
    adv3:{name:'Class Node III',short:'Class-specific passive #3.',detail:'Third advanced-class passive node. Exact effect depends on chosen class.'}
  };
  return m[key]||{name:key,short:'',detail:''};
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
  const chance=(enemy.boss?0.9:0.18) * (state.partyTalents.treasureHunter?1.25:1) * (enemy.affix?1.12:1);
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
    state.partyTalentPts += 1 + (state.wave%5===0?1:0);
    if(firstClear){
      const reward=12+state.wave*5; state.gold+=reward; state.highestWave=state.wave;
      if(state.wave%5===0) state.party.forEach(h=>h.talentPts=(h.talentPts||0)+1);
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
    const postWaveHeal=0.2 + (state.partyTalents.battleMedicLv||0)*0.03;
    state.party.forEach(h=>{h.hp=Math.min(heroMaxHp(h), h.hp + Math.ceil(heroMaxHp(h)*postWaveHeal)); h.cd=0; h.mana=Math.max(0,(h.mana||0)-20);});
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
    state.waveAtkStack=0;
    state.bossPending=false;
    log(`💀 Party wiped. -${penalty}g. Switched to GRIND at Wave ${state.wave}.`);
    state.party.forEach(h=>{h.alive=true;h.hp=Math.ceil(heroMaxHp(h)*0.92);h.cd=0;h.mana=0;h.secondWindUsed=false;});
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
$('autoSkillBtn').onclick=()=>{ state.autoSkillCast=!state.autoSkillCast; draw(); save(); };
$('teamTalentsBtn').onclick=()=>openTeamTalentModal();
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
    apply();
    buys++;
  }
  return buys;
}

function selectedUpgradeHero(){ return state.party[state.upgradeHeroIdx]||state.party[0]; }

$('upAtkBtn').onclick=()=>{ const h=selectedUpgradeHero(); if(!h) return; const buys=buyBulk(()=>heroUpCost(h,'upAtkLv'),()=>{ h.upAtkLv=(h.upAtkLv||0)+1; h.upAtk=(h.upAtk||0)+2; }); if(!buys) return; log(`${h.name} ATK upgraded (${buys}x).`); save(); draw(); };
$('upHpBtn').onclick=()=>{ const h=selectedUpgradeHero(); if(!h) return; const buys=buyBulk(()=>heroUpCost(h,'upHpLv'),()=>{ h.upHpLv=(h.upHpLv||0)+1; h.upHp=(h.upHp||0)+12; h.hp=Math.min(heroMaxHp(h),h.hp+12); }); if(!buys) return; log(`${h.name} Max HP upgraded (${buys}x).`); save(); draw(); };
$('upManaBtn').onclick=()=>{ const h=selectedUpgradeHero(); if(!h) return; const buys=buyBulk(()=>heroUpCost(h,'upManaLv'),()=>{ h.upManaLv=(h.upManaLv||0)+1; h.upMana=(h.upMana||0)+10; h.mana=Math.min(heroManaMax(h),h.mana+10); }); if(!buys) return; log(`${h.name} Max Mana upgraded (${buys}x).`); save(); draw(); };
$('upCritBtn').onclick=()=>{ const h=selectedUpgradeHero(); if(!h) return; const buys=buyBulk(()=>heroUpCost(h,'upCritLv'),()=>{ h.upCritLv=(h.upCritLv||0)+1; h.upCrit=(h.upCrit||0)+0.01; }); if(!buys) return; log(`${h.name} Crit upgraded (${buys}x).`); save(); draw(); };
$('upCritDmgBtn').onclick=()=>{ const h=selectedUpgradeHero(); if(!h) return; const buys=buyBulk(()=>heroUpCost(h,'upCritDmgLv'),()=>{ h.upCritDmgLv=(h.upCritDmgLv||0)+1; h.upCritDmg=(h.upCritDmg||0)+0.05; }); if(!buys) return; log(`${h.name} Crit Damage upgraded (${buys}x).`); save(); draw(); };
$('upDefBtn').onclick=()=>{ const h=selectedUpgradeHero(); if(!h) return; const buys=buyBulk(()=>heroUpCost(h,'upDefLv'),()=>{ h.upDefLv=(h.upDefLv||0)+1; h.upDef=(h.upDef||0)+1; }); if(!buys) return; log(`${h.name} Defense upgraded (${buys}x).`); save(); draw(); };

function openTalentModal(i){
  state.talentHeroIdx=i;
  renderTalentModal();
  $('talentModal').classList.remove('hidden');
}
function renderTalentModal(){
  const h=state.party[state.talentHeroIdx]; if(!h) return;
  $('talentHeroTitle').textContent=`${h.name} Talent Tree`;
  $('talentHeroPts').innerHTML=`<div class='stat-row'><span>Talent points</span><span>${h.talentPts||0}</span></div><div class='stat-row'><span>Class</span><span>${h.advClass||'Base'}</span></div>`;
  const baseKeys=['secondWind','bloodlust','echo','battleRhythm','giantSlayer'];
  const baseButtons=baseKeys.map((k)=>{
    const meta=talentMeta(k);
    const owned=!!h.talents[k];
    return `<button data-btal='${k}' ${owned?'disabled':''} title='${meta.detail}'><b>${meta.name} (${owned?'owned':'5 pt'})</b><br><small>${meta.short}</small></button>`;
  }).join('');
  const atkRank=h.talents.atkPctLv||0, hpRank=h.talents.hpPctLv||0;
  const atkMeta=talentMeta('atkPctLv'), hpMeta=talentMeta('hpPctLv');
  $('baseTalentButtons').innerHTML=baseButtons +
    `<button data-btal='atkPctLv' ${atkRank>=5?'disabled':''} title='${atkMeta.detail}'><b>${atkMeta.name} [${atkRank}/5] (${atkRank>=5?'max':'5 pt'})</b><br><small>${atkMeta.short}</small></button>`+
    `<button data-btal='hpPctLv' ${hpRank>=5?'disabled':''} title='${hpMeta.detail}'><b>${hpMeta.name} [${hpRank}/5] (${hpRank>=5?'max':'5 pt'})</b><br><small>${hpMeta.short}</small></button>`;
  const [a,b]=advancedOptions(h.name);
  const preview=(cls)=>{
    const fake={...h,advClass:cls};
    return `<b>${cls}</b> — Skill: ${skillName(fake)}<br><small>${skillTooltip(fake)}</small><br>${advTalentNames(cls).join(' • ')}`;
  };
  $('advPreview').innerHTML=`You can inspect before choosing:<br>${preview(a)}<br><br>${preview(b)}`;
  if(!h.advClass){ $('advTalentButtons').innerHTML=`<small>Choose advanced class in Party panel at Lv 10+ to unlock class tree.</small>`; return; }
  const names=advTalentNames(h.advClass);
  $('advTalentButtons').innerHTML=[0,1,2].map(i=>{
    const key=`adv${i+1}`;
    const owned=!!h.talents[key];
    const line=names[i];
    const parts=line.split('(');
    const title=parts[0].trim();
    const short=(parts[1]?parts[1].replace(')',''):'Class passive').trim();
    return `<button data-atal='${key}' ${owned?'disabled':''} title='${line}'><b>${title} (${owned?'owned':'5 pt'})</b><br><small>${short}</small></button>`;
  }).join('');
}
function buyHeroTalent(hero,key){
  if((hero.talentPts||0)<TALENT_COST) return;
  if(key==='atkPctLv' || key==='hpPctLv'){
    if((hero.talents[key]||0)>=5) return;
    hero.talents[key]=(hero.talents[key]||0)+1;
  }else{
    if(hero.talents[key]) return;
    hero.talents[key]=true;
  }
  hero.talentPts-=TALENT_COST;
  save(); draw(); renderTalentModal();
}

function openTeamTalentModal(){ renderTeamTalentModal(); $('teamTalentModal').classList.remove('hidden'); }
function renderTeamTalentModal(){
  const t=state.partyTalents, meta=teamTalentMeta();
  $('teamTalentPts').innerHTML=`<div class='stat-row'><span>Team talent points</span><span>${state.partyTalentPts||0}</span></div>`;
  const make=(key)=>{
    const m=meta[key];
    const isRank=m.type==='rank';
    const lv=t[key]||0;
    const owned=!isRank && !!t[key];
    const maxed=isRank && lv>=(m.max||1);
    const label=isRank?`${m.name} [${lv}/${m.max}]`:`${m.name} (${owned?'owned':'5 pt'})`;
    const disabled=(state.partyTalentPts||0)<TEAM_TALENT_COST || owned || maxed;
    return `<button data-ptal='${key}' ${disabled?'disabled':''} title='${m.detail}'><b>${label}</b><br><small>${m.short}</small></button>`;
  };
  $('teamTalentButtons').innerHTML=['treasureHunter','warBannerLv','ironWallLv','battleMedicLv','furyDrumsLv'].map(make).join('');
}
function buyTeamTalent(key){
  if((state.partyTalentPts||0)<TEAM_TALENT_COST) return;
  const meta=teamTalentMeta()[key];
  if(!meta) return;
  if(meta.type==='rank'){
    if((state.partyTalents[key]||0)>=meta.max) return;
    state.partyTalents[key]=(state.partyTalents[key]||0)+1;
  }else{
    if(state.partyTalents[key]) return;
    state.partyTalents[key]=true;
  }
  state.partyTalentPts-=TEAM_TALENT_COST;
  save(); draw(); renderTeamTalentModal();
}

$('buyAmt1').onclick=()=>{ state.shopBuyAmount=1; draw(); };
$('buyAmt5').onclick=()=>{ state.shopBuyAmount=5; draw(); };
$('buyAmt10').onclick=()=>{ state.shopBuyAmount=10; draw(); };
$('buyAmtMAX').onclick=()=>{ state.shopBuyAmount='max'; draw(); };
$('statsViewTotal').onclick=()=>{ state.statsView='total'; draw(); save(); };
$('statsViewBattle').onclick=()=>{ state.statsView='battle'; draw(); save(); };

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
$('baseTalentButtons').onclick=(ev)=>{
  const b=ev.target.closest('button[data-btal]'); if(!b) return;
  const h=state.party[state.talentHeroIdx]; if(!h) return;
  buyHeroTalent(h,b.dataset.btal);
};
$('advTalentButtons').onclick=(ev)=>{
  const b=ev.target.closest('button[data-atal]'); if(!b) return;
  const h=state.party[state.talentHeroIdx]; if(!h || !h.advClass) return;
  buyHeroTalent(h,b.dataset.atal);
};
$('teamTalentButtons').onclick=(ev)=>{
  const b=ev.target.closest('button[data-ptal]'); if(!b) return;
  buyTeamTalent(b.dataset.ptal);
};
$('closeTalentModalBtn').onclick=()=>$('talentModal').classList.add('hidden');
$('closeTeamTalentModalBtn').onclick=()=>$('teamTalentModal').classList.add('hidden');

$('party').onclick=(ev)=>{
  const sbtn=ev.target.closest('button[data-skill-hero]');
  if(sbtn){ castHeroSkill(Number(sbtn.dataset.skillHero)); save(); return; }
  const tbtn=ev.target.closest('button[data-open-tal]');
  if(tbtn){ openTalentModal(Number(tbtn.dataset.openTal)); return; }
  const btn=ev.target.closest('button[data-class]'); if(!btn) return;
  const i=Number(btn.dataset.i), h=state.party[i]; if(!h||h.advClass) return;
  h.advClass=btn.dataset.class; log(`⚔️ ${h.name} advanced to ${h.advClass}`); save(); draw();
};
$('equipHeroList').onclick=(ev)=>{ const b=ev.target.closest('button[data-ehero]'); if(!b) return; state.equipHeroIdx=Number(b.dataset.ehero); drawEquipUI(); };
$('upgradeHeroList').onclick=(ev)=>{ const b=ev.target.closest('button[data-uphero]'); if(!b) return; state.upgradeHeroIdx=Number(b.dataset.uphero); drawUpgradeUI(); };

function normalizeLoadedState(){
  state.party=state.party.map(h=>{
    if(!h.equip){ const e={}; SLOTS.forEach(s=>e[s]=null); h.equip=e; }
    if(h.lvl==null) h.lvl=1; if(h.xp==null) h.xp=0; if(!h.advClass) h.advClass=null;
    if(h.secondWindUsed==null) h.secondWindUsed=false;
    if(h.abilityCd==null) h.abilityCd=0; if(h.tempShield==null) h.tempShield=0;
    if(h.mana==null) h.mana=(h.focus==null?0:h.focus);
    if(h.focus!=null) delete h.focus;
    if(h.upAtkLv==null) h.upAtkLv=0; if(h.upHpLv==null) h.upHpLv=0; if(h.upManaLv==null) h.upManaLv=0; if(h.upCritLv==null) h.upCritLv=0; if(h.upCritDmgLv==null) h.upCritDmgLv=0; if(h.upDefLv==null) h.upDefLv=0;
    if(h.upAtk==null) h.upAtk=0; if(h.upHp==null) h.upHp=0; if(h.upMana==null) h.upMana=0; if(h.upCrit==null) h.upCrit=0; if(h.upCritDmg==null) h.upCritDmg=0; if(h.upDef==null) h.upDef=0;
    if(h.talentPts==null) h.talentPts=0;
    if(!h.talents) h.talents={secondWind:false,bloodlust:false,echo:false,battleRhythm:false,giantSlayer:false,atkPctLv:0,hpPctLv:0,adv1:false,adv2:false,adv3:false};
    ['secondWind','bloodlust','echo','battleRhythm','giantSlayer','adv1','adv2','adv3'].forEach(k=>{ if(h.talents[k]==null) h.talents[k]=false; });
    if(h.talents.atkPctLv==null) h.talents.atkPctLv=0;
    if(h.talents.hpPctLv==null) h.talents.hpPctLv=0;
    recomputeGearStats(h);
    h.hp=Math.min(h.hp||heroMaxHp(h),heroMaxHp(h));
    h.alive=h.hp>0;
    return h;
  });
  if(!state.partyTalents) state.partyTalents={treasureHunter:false,warBannerLv:0,ironWallLv:0,battleMedicLv:0,furyDrumsLv:0};
  if(state.partyTalentPts==null) state.partyTalentPts=0;
  if(state.shopBuyAmount==null) state.shopBuyAmount=1;
  if(state.pendingHeroUnlock==null) state.pendingHeroUnlock=false;
  if(state.upgradeHeroIdx==null) state.upgradeHeroIdx=0;
  if(state.autoSkillCast==null) state.autoSkillCast=true;
  if(!state.statsView) state.statsView='total';
  if(!state.mode) state.mode='push';
  if(!state.highestWave && state.wave>1) state.highestWave=state.wave-1;
  state.wave=Math.max(1,state.wave||1);
  if(!state.stats) state.stats={waveKills:0,dmgDealt:0,dmgTaken:0,wavesCleared:0,lastWaveMs:0,waveStartTs:Date.now()};
  if(!state.watchdog) state.watchdog={noChangeTicks:0,lastTotalHp:0};
  state.stats.waveStartTs=state.stats.waveStartTs||Date.now();
  state.unlockedSlots=Math.max(1,Math.min(3,state.party.length||1));
  if(state.nextHeroUnlockWave==null) state.nextHeroUnlockWave=state.unlockedSlots===1?50:state.unlockedSlots===2?100:null;
}

function startNewGame(playerName,startClass){
  const hero=heroTemplate(startClass||'Warrior');
  state.playerName=(playerName||'Commander').trim()||'Commander';
  state.wave=1; state.highestWave=0; state.gold=0; state.wins=0; state.running=false; state.paused=false;
  state.waveAtkStack=0;
  state.partyTalentPts=0;
  state.partyTalents={treasureHunter:false,warBannerLv:0,ironWallLv:0,battleMedicLv:0,furyDrumsLv:0};
  state.party=[hero];
  state.unlockedSlots=1;
  state.nextHeroUnlockWave=50;
  state.pendingHeroUnlock=false;
  state.upgradeHeroIdx=0;
  state.statsView='total';
  state.autoSkillCast=true;
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