'use strict';
const $=id=>document.getElementById(id), P=RocketPhysics;
let current,pinned=null,playing=false,started=0,animation=0;
const fmt=(x,n=1)=>x.toLocaleString('en-US',{maximumFractionDigits:n,minimumFractionDigits:n});
function inputs(){const p={...P.defaults};for(const k of ['dry','prop','burn','thrust','area','cd'])p[k]=Number($(k).value);p.drag=$('drag').checked;return p;}
function stop(){playing=false;cancelAnimationFrame(animation);$('play').textContent='▶ Play';}
function plot(id,key){
  const rows=current.rows, all=pinned?rows.concat(pinned.rows):rows;
  const width=800,height=200,pad={l:52,r:15,t:12,b:28};
  const xmax=Math.max(rows.at(-1).t,pinned?.rows.at(-1).t||0,1);
  let ymin=Math.min(0,...all.map(r=>r[key])),ymax=Math.max(1,...all.map(r=>r[key]));
  const span=ymax-ymin;ymin-=key==='v'?span*.06:0;ymax+=span*.08;
  const x=t=>pad.l+t/xmax*(width-pad.l-pad.r),y=v=>height-pad.b-(v-ymin)/(ymax-ymin)*(height-pad.t-pad.b);
  const path=data=>data.filter((_,i)=>i%Math.max(1,Math.floor(data.length/1400))===0||i===data.length-1).map((r,i)=>(i?'L':'M')+x(r.t).toFixed(2)+','+y(r[key]).toFixed(2)).join(' ');
  let svg='';for(let i=0;i<5;i++){const v=ymin+(ymax-ymin)*i/4;svg+=`<line x1="${pad.l}" x2="785" y1="${y(v)}" y2="${y(v)}" stroke="#2c3743"/><text x="43" y="${y(v)+4}" fill="#9caebb" font-size="10" text-anchor="end">${fmt(v,0)}</text>`;}
  for(let i=0;i<6;i++){const t=xmax*i/5;svg+=`<text x="${x(t)}" y="194" fill="#9caebb" font-size="10" text-anchor="middle">${fmt(t,1)} s</text>`;}
  if(current.burnout)svg+=`<line x1="${x(current.p.burn)}" x2="${x(current.p.burn)}" y1="12" y2="172" stroke="#647584" stroke-dasharray="3 5"/>`;
  if(pinned)svg+=`<path d="${path(pinned.rows)}" fill="none" stroke="#83c8ff" stroke-width="2" opacity=".7" stroke-dasharray="6 4"/>`;
  svg+=`<path d="${path(rows)}" fill="none" stroke="#b6f18c" stroke-width="2.5"/><circle class="marker" cx="${x(0)}" cy="${y(rows[0][key])}" r="4" fill="#fff" stroke="#10151b" stroke-width="2"/>`;
  $(id).innerHTML=svg;$(id)._coords={x,y};
}
function scrub(){
  const f=Number($('scrub').value)/1000,r=current.rows[Math.round(f*(current.rows.length-1))];
  $('readout').innerHTML=`T+ ${fmt(r.t,2)} s<br>${r.phase}`;
  for(const [id,key] of [['heightChart','h'],['velocityChart','v']]){const circle=$(id).querySelector('.marker'),c=$(id)._coords;circle.setAttribute('cx',c.x(r.t));circle.setAttribute('cy',c.y(r[key]));}
}
function render(){
  stop();$('apogee').textContent=fmt(current.apogee.h);$('speed').textContent=fmt(current.maxSpeed);$('duration').textContent=fmt(current.rows.at(-1).t);$('twr').textContent=fmt(current.twr,2);
  const c=current.burnout;
  $('cutoff').innerHTML=c?`T+ ${fmt(c.t,2)} s<br>${fmt(c.h)} m · ${fmt(c.v)} m/s`:'No flight cutoff recorded';
  $('top').innerHTML=`T+ ${fmt(current.apogee.t,2)} s<br>${fmt(current.apogee.h)} m`;
  $('landing').innerHTML=current.landed?`T+ ${fmt(current.rows.at(-1).t,2)} s<br>No recovery system modeled`:'No ground crossing in this run';
  $('status').textContent=!current.flying?'No liftoff: thrust never overcame vehicle weight during the burn.':current.truncated?'Run stopped at the time limit. Flight duration is incomplete.':'Simulation complete. Ground crossing assumes descent without a recovery system.';
  $('pinnedLegend').hidden=!pinned;$('clear').hidden=!pinned;
  $('comparison').textContent=pinned?`Apogee difference: ${current.apogee.h>=pinned.apogee.h?'+':''}${fmt(current.apogee.h-pinned.apogee.h)} m`:'No comparison pinned yet.';
  plot('heightChart','h');plot('velocityChart','v');$('scrub').value=0;scrub();
}
$('config').addEventListener('submit',e=>{e.preventDefault();try{current=P.simulate(inputs());$('error').textContent='';render();}catch(err){$('error').textContent=err.message;}});
$('reset').addEventListener('click',()=>{HTMLFormElement.prototype.reset.call($('config'));current=P.simulate();$('error').textContent='';render();});
$('pin').addEventListener('click',()=>{pinned=current;render();});$('clear').addEventListener('click',()=>{pinned=null;render();});
$('scrub').addEventListener('input',()=>{stop();scrub();});
$('play').addEventListener('click',()=>{if(playing){stop();return;}playing=true;$('play').textContent='Ⅱ Pause';if(Number($('scrub').value)>=1000)$('scrub').value=0;started=performance.now()-Number($('scrub').value)*10;const tick=now=>{if(!playing)return;$('scrub').value=Math.min(1000,(now-started)/10);scrub();if(Number($('scrub').value)>=1000)stop();else animation=requestAnimationFrame(tick);};animation=requestAnimationFrame(tick);});
$('csv').addEventListener('click',()=>{const keys=['t','h','v','m','a','q','phase'];const text=['time_s,altitude_m,vertical_velocity_m_s,mass_kg,net_acceleration_m_s2,dynamic_pressure_Pa,phase',...current.rows.map(r=>keys.map(k=>typeof r[k]==='number'?r[k].toFixed(6):r[k]).join(','))].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv'})),a=document.createElement('a');a.href=url;a.download='rocket-flight.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('checks').innerHTML=P.checks().map(c=>`<div class="check"><span>${c.name}<br><small>Error ${c.error.toExponential(2)} ${c.unit} · tolerance ${c.tolerance} ${c.unit}</small></span><strong class="${c.pass?'pass':'notice'}">${c.pass?'PASS':'FAIL'}</strong></div>`).join('');
current=P.simulate();render();
