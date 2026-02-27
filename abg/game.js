const SAVE_KEY='abg_v02_save';
const state={wave:1,gold:0,wins:0,teamBuffAtk:0,teamBuffHp:0,running:false,paused:false,tick:null,speed:1,party:[mkHero('Warrior','assets/warrior.svg',56,8,'block'),mkHero('Ranger','assets/ranger.svg',40,11,'crit'),mkHero('Mage','assets/mage.svg',34,12,'burst')],enemies:[]};

function mkHero(name,icon,hp,atk,skill){return {name,icon,maxHp:hp,hp,atk,alive:true,skill,cd:0}};
function mkEnemy(i,w){const base=20+w*7;const icons=['assets/mob1.svg','assets/mob2.svg','assets/mob3.svg'];return {name:`Mob ${i+1}`,icon:icons[i%icons.length],maxHp:base,hp:base,atk:5+w*2,alive:true}};
const $=id=>document.getElementById(id);
const alive=a=>a.filter(x=>x.alive);
const pick=a=>{const x=alive(a);return x[Math.floor(Math.random()*x.length)]};

function log(t){const el=$('log');el.innerHTML=`<div>${t}</div>`+el.innerHTML}

function hpPct(u){return Math.max(0,Math.min(100,(u.hp/Math.max(1,u.maxHp+ (u.icon?state.teamBuffHp:0)))*100));}

function drawList(id,arr,isParty=true){
  $(id).innerHTML=arr.map(u=>`<div class='unit ${u.alive?'':'dead'}'>
      <div>
        <div class='name'><img class='mini-ico' src='${u.icon}' alt=''> ${u.name}</div>
        <div class='hpbar'><span style='width:${isParty?Math.max(0,u.hp)/(u.maxHp+state.teamBuffHp)*100:Math.max(0,u.hp)/u.maxHp*100}%'></span></div>
      </div>
      <div>ATK ${isParty?u.atk+state.teamBuffAtk:u.atk}</div>
    </div>`).join('');
}

function drawBattlefield(){
  $('partyLane').innerHTML=state.party.map(u=>`<div class='sprite ${u.alive?'':'dead'}'><img src='${u.icon}' alt=''></div>`).join('');
  $('enemyLane').innerHTML=state.enemies.map(u=>`<div class='sprite enemy ${u.alive?'':'dead'}'><img src='${u.icon}' alt=''></div>`).join('');
}

function draw(){
  $('wave').textContent=state.wave; $('gold').textContent=state.gold; $('wins').textContent=state.wins; $('speedLabel').textContent=`${state.speed}x`;
  drawList('party',state.party,true); drawList('enemies',state.enemies,false); drawBattlefield();
}

function save(){localStorage.setItem(SAVE_KEY,JSON.stringify({wave:state.wave,gold:state.gold,wins:state.wins,teamBuffAtk:state.teamBuffAtk,teamBuffHp:state.teamBuffHp,party:state.party.map(({name,icon,maxHp,hp,atk,alive,skill,cd})=>({name,icon,maxHp,hp,atk,alive,skill,cd}))}))}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); if(!s) return; Object.assign(state,s); if(s.party) state.party=s.party;}catch{}}

function startWave(){ if(state.running) return; state.enemies=Array.from({length:Math.min(6,2+Math.floor(state.wave/2))},(_,i)=>mkEnemy(i,state.wave)); state.running=true; state.paused=false; log(`Wave ${state.wave} begins!`); draw(); loop(); }

function loop(){clearInterval(state.tick); state.tick=setInterval(()=>{if(!state.paused) step();}, Math.max(180,650/state.speed));}

function heroAttack(a,b){
  let dmg=a.atk+state.teamBuffAtk;
  if(a.skill==='crit' && Math.random()<0.2){dmg=Math.floor(dmg*1.8); log(`💥 ${a.name} crit!`)}
  if(a.skill==='burst' && a.cd<=0){
    const targets=alive(state.enemies).slice(0,2);
    targets.forEach(t=>{t.hp-=Math.max(1,Math.floor(dmg*0.75)); if(t.hp<=0){t.alive=false; log(`✨ ${a.name} burst deleted ${t.name}`);}});
    a.cd=4; return;
  }
  b.hp-=Math.max(1,dmg);
  if(b.hp<=0){b.alive=false; log(`${a.name} defeated ${b.name}`)}
  if(a.cd>0) a.cd--;
}

function enemyAttack(c,d){
  let dmg=Math.max(1,c.atk);
  if(d.skill==='block' && Math.random()<0.25){dmg=Math.floor(dmg*0.55); log(`🛡️ ${d.name} blocked part of the hit`) }
  d.hp-=dmg;
  if(d.hp<=0){d.alive=false; log(`${c.name} downed ${d.name}`)}
}

function step(){
  const p=alive(state.party), e=alive(state.enemies); if(!p.length||!e.length) return endWave();
  const a=pick(p), b=pick(e); heroAttack(a,b);
  const e2=alive(state.enemies); if(!e2.length) return endWave();
  const c=pick(e2), d=pick(p); enemyAttack(c,d);
  draw();
}

function endWave(){
  clearInterval(state.tick); state.running=false;
  const p=alive(state.party).length, e=alive(state.enemies).length;
  if(p>0&&e===0){ const reward=14+state.wave*5; state.gold+=reward; state.wins++; log(`✅ Wave cleared. +${reward}g`); state.wave++; }
  else if(p===0){ log('💀 Party wiped. Reviving for 15g penalty.'); state.gold=Math.max(0,state.gold-15); state.party.forEach(u=>{u.alive=true;u.hp=Math.ceil((u.maxHp+state.teamBuffHp)*0.7);u.cd=0;}); }
  save(); draw();
}

$('startBtn').onclick=startWave;
$('pauseBtn').onclick=()=>{ if(!state.running) return; state.paused=!state.paused; $('pauseBtn').textContent=state.paused?'Resume':'Pause'; };
$('speedBtn').onclick=()=>{ state.speed=state.speed===1?2:state.speed===2?3:1; loop(); draw(); };
$('resetBtn').onclick=()=>{ localStorage.removeItem(SAVE_KEY); location.reload(); };
$('healBtn').onclick=()=>{ if(state.gold<10||state.running) return; state.gold-=10; state.party.forEach(u=>{if(u.alive)u.hp=Math.min(u.maxHp+state.teamBuffHp,u.hp+14)}); log('Party healed.'); save(); draw(); };
$('atkBtn').onclick=()=>{ if(state.gold<20||state.running) return; state.gold-=20; state.teamBuffAtk++; log('Team ATK +1'); save(); draw(); };
$('hpBtn').onclick=()=>{ if(state.gold<20||state.running) return; state.gold-=20; state.teamBuffHp+=5; state.party.forEach(u=>u.hp+=5); log('Team Max HP +5'); save(); draw(); };

load(); draw(); log('Prototype ready. Press Start / Next Wave.');