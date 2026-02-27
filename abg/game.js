const SAVE_KEY='abg_v03_save';
const state={
  wave:1,gold:0,wins:0,teamBuffAtk:0,teamBuffHp:0,running:false,paused:false,tick:null,speed:1,
  autoMode:false,bossPending:false,talentPts:0,critBonus:0,
  party:[mkHero('Warrior','assets/warrior.svg',64,9,'block'),mkHero('Ranger','assets/ranger.svg',46,12,'crit'),mkHero('Mage','assets/mage.svg',40,13,'burst')],
  enemies:[]
};

function mkHero(name,icon,hp,atk,skill){return {name,icon,maxHp:hp,hp,atk,alive:true,skill,cd:0,gearAtk:0,gearHp:0}};
function mkEnemy(i,w,boss=false){
  const icons=['assets/mob1.svg','assets/mob2.svg','assets/mob3.svg'];
  const hp=(boss?60:18)+w*(boss?12:4);
  const atk=(boss?10:4)+w*(boss?2:1);
  return {name:boss?`Boss ${w}`:`Mob ${i+1}`,icon:icons[i%icons.length],maxHp:hp,hp,atk,alive:true,boss};
}

const $=id=>document.getElementById(id);
const alive=a=>a.filter(x=>x.alive);
const pick=a=>{const x=alive(a);return x[Math.floor(Math.random()*x.length)]};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function log(t){$('log').innerHTML=`<div>${t}</div>`+$('log').innerHTML}
function lootLog(t,cls=''){ $('loot').innerHTML=`<div class='${cls}'>${t}</div>`+$('loot').innerHTML }

function heroAtk(h){return h.atk+state.teamBuffAtk+h.gearAtk}
function heroMaxHp(h){return h.maxHp+state.teamBuffHp+h.gearHp}

function drawList(id,arr,isParty=true){
  $(id).innerHTML=arr.map(u=>`<div class='unit ${u.alive?'':'dead'}'>
      <div>
        <div class='name'><img class='mini-ico' src='${u.icon}' alt=''> ${u.name}${u.boss?' 👑':''}</div>
        <div class='hpbar'><span style='width:${isParty?clamp((Math.max(0,u.hp)/heroMaxHp(u))*100,0,100):clamp((Math.max(0,u.hp)/u.maxHp)*100,0,100)}%'></span></div>
      </div>
      <div>ATK ${isParty?heroAtk(u):u.atk}</div>
    </div>`).join('');
}

function drawBattlefield(){
  $('partyLane').innerHTML=state.party.map((u,i)=>`<div class='sprite ${u.alive?'':'dead'}' id='p${i}'><img src='${u.icon}' alt=''></div>`).join('');
  $('enemyLane').innerHTML=state.enemies.map((u,i)=>`<div class='sprite enemy ${u.alive?'':'dead'}' id='e${i}'><img src='${u.icon}' alt=''></div>`).join('');
}

function draw(){
  $('wave').textContent=state.wave; $('gold').textContent=state.gold; $('wins').textContent=state.wins; $('speedLabel').textContent=`${state.speed}x`;
  $('talentPts').textContent=state.talentPts;
  $('vsLabel').textContent=state.bossPending?'BOSS':'AUTO';
  $('startBtn').textContent=state.running?'In Combat':state.bossPending?'Fight Boss':'Start Run';
  drawList('party',state.party,true); drawList('enemies',state.enemies,false); drawBattlefield();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({
  wave:state.wave,gold:state.gold,wins:state.wins,teamBuffAtk:state.teamBuffAtk,teamBuffHp:state.teamBuffHp,
  speed:state.speed,talentPts:state.talentPts,critBonus:state.critBonus,
  party:state.party.map(h=>({...h}))
}))}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(!s)return; Object.assign(state,s); if(s.party) state.party=s.party;}catch{}}

function spawnWave(){
  const boss=state.wave%5===0;
  state.enemies=boss?[mkEnemy(0,state.wave,true)]:Array.from({length:Math.min(5,2+Math.floor(state.wave/2))},(_,i)=>mkEnemy(i,state.wave,false));
  state.bossPending=boss;
}

function startWave(){
  if(state.running) return;
  if(!state.enemies.length) spawnWave();
  state.running=true; state.paused=false;
  log(`${state.bossPending?'👑 Boss':'⚔️ Wave'} ${state.wave} begins!`);
  draw(); loop();
}

function loop(){clearInterval(state.tick); state.tick=setInterval(()=>{if(!state.paused) step();}, Math.max(150,560/state.speed));}

function flash(id){const el=$(id); if(!el) return; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');}

function heroAttack(a,b){
  let dmg=heroAtk(a);
  if(a.skill==='crit' && Math.random()<(0.2+state.critBonus)){dmg=Math.floor(dmg*1.75); log(`💥 ${a.name} crit!`) }
  if(a.skill==='burst' && a.cd<=0){
    const t=alive(state.enemies).slice(0,2);
    t.forEach(x=>{x.hp-=Math.max(1,Math.floor(dmg*0.7)); if(x.hp<=0){x.alive=false; log(`✨ ${a.name} burst defeated ${x.name}`)}});
    a.cd=4; return;
  }
  b.hp-=Math.max(1,dmg); if(b.hp<=0){b.alive=false; log(`${a.name} defeated ${b.name}`)}
  if(a.cd>0) a.cd--;
}
function enemyAttack(c,d){
  let dmg=c.atk;
  if(d.skill==='block' && Math.random()<0.26){dmg=Math.floor(dmg*0.55); log(`🛡️ ${d.name} blocked`) }
  d.hp-=Math.max(1,dmg); if(d.hp<=0){d.alive=false; log(`${c.name} downed ${d.name}`)}
}

function step(){
  const p=alive(state.party), e=alive(state.enemies); if(!p.length||!e.length) return endWave();
  const a=pick(p), b=pick(e); heroAttack(a,b); flash(`e${state.enemies.indexOf(b)}`);
  const e2=alive(state.enemies); if(!e2.length) return endWave();
  const c=pick(e2), d=pick(p); enemyAttack(c,d); flash(`p${state.party.indexOf(d)}`);
  draw();
}

function dropLoot(){
  const roll=Math.random();
  const rarity=roll<0.7?'Rare':roll<0.94?'Mythic':'Legendary';
  const cls=rarity==='Rare'?'loot-r':rarity==='Mythic'?'loot-m':'loot-l';
  const atk=rarity==='Rare'?1:rarity==='Mythic'?2:3;
  const hp=rarity==='Rare'?4:rarity==='Mythic'?8:14;
  const hero=state.party[Math.floor(Math.random()*state.party.length)];
  hero.gearAtk+=atk; hero.gearHp+=hp; hero.hp=Math.min(heroMaxHp(hero),hero.hp+hp);
  lootLog(`🎁 ${rarity}: ${hero.name} +${atk} ATK / +${hp} HP`,cls);
}

function autoAdvance(){
  if(state.wave%5===0){ state.bossPending=true; draw(); log('👑 Boss gate reached. Press Start to continue.'); return; }
  spawnWave(); startWave();
}

function endWave(){
  clearInterval(state.tick); state.running=false;
  const p=alive(state.party).length, e=alive(state.enemies).length;
  if(p>0&&e===0){
    const reward=(state.bossPending?30:10)+state.wave*3; state.gold+=reward; state.wins++; log(`✅ Cleared wave ${state.wave}. +${reward}g`);
    state.party.forEach(h=>{h.hp=Math.min(heroMaxHp(h), h.hp + Math.ceil(heroMaxHp(h)*0.12));}); // small auto-heal between waves
    dropLoot();
    if(state.wave%3===0){state.talentPts++; log('🌟 Talent point gained!')}
    state.wave++; state.enemies=[]; state.bossPending=false; save(); draw();
    if(state.autoMode) setTimeout(autoAdvance,500);
    return;
  }
  if(p===0){
    log('💀 Party wiped. Reviving for 10g penalty.'); state.gold=Math.max(0,state.gold-10);
    state.party.forEach(h=>{h.alive=true;h.hp=Math.ceil(heroMaxHp(h)*0.8);h.cd=0});
    state.enemies=[]; state.bossPending=false;
  }
  save(); draw();
}

$('startBtn').onclick=()=>{ if(!state.autoMode) state.autoMode=true; startWave(); };
$('pauseBtn').onclick=()=>{ if(!state.running) return; state.paused=!state.paused; $('pauseBtn').textContent=state.paused?'Resume':'Pause'; };
$('speedBtn').onclick=()=>{ state.speed=state.speed===1?2:state.speed===2?3:1; loop(); draw(); save(); };
$('resetBtn').onclick=()=>{ localStorage.removeItem(SAVE_KEY); location.reload(); };
$('healBtn').onclick=()=>{ if(state.gold<10||state.running) return; state.gold-=10; state.party.forEach(h=>{if(h.alive)h.hp=Math.min(heroMaxHp(h),h.hp+15)}); log('Party healed.'); save(); draw(); };
$('atkBtn').onclick=()=>{ if(state.gold<20||state.running) return; state.gold-=20; state.teamBuffAtk++; log('Team ATK +1'); save(); draw(); };
$('hpBtn').onclick=()=>{ if(state.gold<20||state.running) return; state.gold-=20; state.teamBuffHp+=5; state.party.forEach(h=>h.hp=Math.min(heroMaxHp(h),h.hp+5)); log('Team Max HP +5'); save(); draw(); };
$('talAtk').onclick=()=>{ if(state.talentPts<1) return; state.talentPts--; state.teamBuffAtk+=2; log('Talent: +2 Team ATK'); save(); draw(); };
$('talHp').onclick=()=>{ if(state.talentPts<1) return; state.talentPts--; state.teamBuffHp+=12; state.party.forEach(h=>h.hp=Math.min(heroMaxHp(h),h.hp+12)); log('Talent: +12 Team Max HP'); save(); draw(); };
$('talCrit').onclick=()=>{ if(state.talentPts<1) return; state.talentPts--; state.critBonus+=0.05; log('Talent: +5% Crit chance'); save(); draw(); };

load(); draw(); log('v0.3 ready. Press Start Run. Waves auto-advance until boss waves (5,10,15...).');