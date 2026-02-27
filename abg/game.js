const state={wave:1,gold:0,wins:0,teamBuffAtk:0,teamBuffHp:0,running:false,tick:null,party:[mkHero('Warrior',48,8),mkHero('Ranger',36,10),mkHero('Mage',30,12)],enemies:[]};
function mkHero(name,hp,atk){return {name,maxHp:hp,hp,atk,alive:true}}
function mkEnemy(i,w){const base=18+w*6;return {name:`Mob ${i+1}`,maxHp:base,hp:base,atk:5+w*2,alive:true}}
const $=id=>document.getElementById(id);
function log(t){const el=$('log');el.innerHTML=`<div>${t}</div>`+el.innerHTML}
function draw(){ $('wave').textContent=state.wave; $('gold').textContent=state.gold; $('wins').textContent=state.wins;
 $('party').innerHTML=state.party.map(u=>`<div class='unit ${u.alive?'':'dead'}'><span>${u.name}</span><span>ATK ${u.atk+state.teamBuffAtk} | <span class='hp'>${Math.max(0,u.hp)}/${u.maxHp+state.teamBuffHp}</span></span></div>`).join('');
 $('enemies').innerHTML=state.enemies.map(u=>`<div class='unit ${u.alive?'':'dead'}'><span>${u.name}</span><span>ATK ${u.atk} | <span class='hp'>${Math.max(0,u.hp)}/${u.maxHp}</span></span></div>`).join(''); }
function alive(arr){return arr.filter(x=>x.alive)}
function pick(arr){const a=alive(arr); return a[Math.floor(Math.random()*a.length)]}
function startWave(){ if(state.running) return; state.enemies=Array.from({length:Math.min(5,2+Math.floor(state.wave/2))},(_,i)=>mkEnemy(i,state.wave)); state.running=true; log(`Wave ${state.wave} begins!`); draw(); state.tick=setInterval(step,650)}
function step(){ const p=alive(state.party), e=alive(state.enemies); if(!p.length||!e.length) return endWave();
 const a=pick(p), b=pick(e); b.hp-=Math.max(1,(a.atk+state.teamBuffAtk)); if(b.hp<=0){b.alive=false; log(`${a.name} defeated ${b.name}`)}
 const e2=alive(state.enemies); if(!e2.length) return endWave();
 const c=pick(e2), d=pick(p); d.hp-=Math.max(1,c.atk); if(d.hp<=0){d.alive=false; log(`${c.name} downed ${d.name}`)}
 draw(); }
function endWave(){ clearInterval(state.tick); state.running=false; const p=alive(state.party).length, e=alive(state.enemies).length;
 if(p>0&&e===0){ const reward=12+state.wave*4; state.gold+=reward; state.wins++; log(`✅ Wave cleared. +${reward}g`); state.wave++; }
 else if(p===0){ log('💀 Party wiped. Reviving for 15g penalty.'); state.gold=Math.max(0,state.gold-15); state.party.forEach(u=>{u.alive=true;u.hp=Math.ceil((u.maxHp+state.teamBuffHp)*0.7)}); }
 draw(); }
$('startBtn').onclick=startWave;
$('healBtn').onclick=()=>{ if(state.gold<10||state.running) return; state.gold-=10; state.party.forEach(u=>{if(u.alive)u.hp=Math.min(u.maxHp+state.teamBuffHp,u.hp+12)}); log('Party healed.'); draw(); };
$('atkBtn').onclick=()=>{ if(state.gold<20||state.running) return; state.gold-=20; state.teamBuffAtk++; log('Team ATK +1'); draw(); };
$('hpBtn').onclick=()=>{ if(state.gold<20||state.running) return; state.gold-=20; state.teamBuffHp+=5; state.party.forEach(u=>u.hp+=5); log('Team Max HP +5'); draw(); };
draw(); log('Prototype ready. Press Start / Next Wave.');