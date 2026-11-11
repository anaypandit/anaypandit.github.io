(function(root) {
  'use strict';
  const G = 9.80665;
  const defaults = {dry:4, prop:1, burn:5, thrust:90, area:0.012, cd:0.5, drag:true, dt:0.02};
  function validate(p) {
    for (const k of ['dry','prop','burn','thrust','area','cd','dt']) {
      if (!Number.isFinite(p[k]) || p[k] < 0) throw new Error('Enter valid, nonnegative numbers.');
    }
    if(p.dry<=0 || p.prop<=0 || p.burn<=0 || p.dt<=0) throw new Error('Masses, burn duration, and time step must be greater than zero.');
    if(p.dry>100 || p.prop>100 || p.burn>60 || p.thrust>10000 || p.area>2 || p.cd>3 || p.dt>0.1 || p.dt<0.001) throw new Error('Use values inside the displayed limits.');
  }
  const mass = (t,p) => p.dry + p.prop * Math.max(0, 1-t/p.burn);
  const density = h => 1.225 * Math.exp(-Math.max(0,h)/8500);
  function acceleration(t,h,v,p,powered) {
    const d = p.drag ? 0.5*density(h)*p.cd*p.area*v*Math.abs(v) : 0;
    const a = ((powered ? p.thrust : 0)-d)/mass(t,p)-G;
    return h<=0 && v<=0 && a<0 ? 0 : a;
  }
  function rk4(t,y,dt,p,powered) {
    const f = (at,z) => [z[1],acceleration(at,z[0],z[1],p,powered)];
    const add = (a,b,s) => a.map((v,i)=>v+s*b[i]);
    const a=f(t,y), b=f(t+dt/2,add(y,a,dt/2)), c=f(t+dt/2,add(y,b,dt/2)), d=f(t+dt,add(y,c,dt));
    return y.map((v,i)=>v+dt/6*(a[i]+2*b[i]+2*c[i]+d[i]));
  }
  function sample(t,h,v,p) {
    return {t,h,v,m:mass(t,p),a:acceleration(t,h,v,p,t<p.burn),q:0.5*density(h)*v*v,phase:h===0&&v===0?'On pad':t<p.burn?'Powered ascent':v>=0?'Coasting':'Descending'};
  }
  function simulate(options={}) {
    const p={...defaults,...options}; validate(p);
    let t=0,y=[0,0],flying=false,apogee=null,burnout=null,landed=false;
    const rows=[sample(0,0,0,p)];
    while(t<600 && rows.length<100000) {
      const powered=t<p.burn-1e-9;
      const dt=Math.min(p.dt,powered?p.burn-t:p.dt,600-t);
      const prev=rows[rows.length-1];
      let next=rk4(t,y,dt,p,powered),nt=t+dt;
      if(next[0]>1e-7) flying=true;
      if(flying && !apogee && y[1]>0 && next[1]<=0) {
        const s=y[1]/(y[1]-next[1]);
        apogee={t:t+s*dt,h:y[0]+s*(next[0]-y[0])};
      }
      if(flying && next[0]<=0 && next[1]<0) {
        const s=y[0]/(y[0]-next[0]);
        rows.push(sample(t+s*dt,0,y[1]+s*(next[1]-y[1]),p)); landed=true;break;
      }
      next[0]=Math.max(0,next[0]);
      if(next[0]===0 && next[1]<0) next[1]=0;
      t=nt;y=next;const r=sample(t,y[0],y[1],p);rows.push(r);
      if(!burnout && Math.abs(t-p.burn)<1e-8) burnout=r;
      if(!flying && t>=p.burn-1e-8) break;
      if(!Number.isFinite(y[0]+y[1])) throw new Error('The numerical integration diverged. Reduce the time step.');
    }
    if(!apogee) {const top=rows.reduce((a,b)=>b.h>a.h?b:a);apogee={t:top.t,h:top.h};}
    return {p,rows,apogee,burnout,landed,flying,truncated:flying&&!landed,
      maxSpeed:Math.max(...rows.map(r=>Math.abs(r.v))),maxQ:Math.max(...rows.map(r=>r.q)),
      twr:p.thrust/((p.dry+p.prop)*G),isp:p.thrust*p.burn/(p.prop*G),
      idealDV:p.thrust*p.burn/p.prop*Math.log((p.dry+p.prop)/p.dry)};
  }
  function checks() {
    const p={...defaults,drag:false,dt:0.02}; const r=simulate(p);
    const m0=p.dry+p.prop,k=p.prop/p.burn,c=p.thrust/k;
    const expectedV=c*Math.log(m0/p.dry)-G*p.burn;
    const expectedH=c*(p.burn-p.dry/k*Math.log(m0/p.dry))-G*p.burn*p.burn/2;
    const fine=simulate({...defaults,dt:0.01}); const coarse=simulate(defaults);
    const dead=simulate({...defaults,thrust:0});
    return [
      {name:'Burnout velocity · no drag',error:Math.abs(r.burnout.v-expectedV),unit:'m/s',tolerance:1e-5},
      {name:'Burnout altitude · no drag',error:Math.abs(r.burnout.h-expectedH),unit:'m',tolerance:1e-5},
      {name:'Apogee · no drag',error:Math.abs(r.apogee.h-(expectedH+expectedV**2/(2*G))),unit:'m',tolerance:0.002},
      {name:'Time-step convergence · drag',error:Math.abs(fine.apogee.h-coarse.apogee.h),unit:'m',tolerance:0.01},
      {name:'Zero thrust stays on pad',error:dead.apogee.h,unit:'m',tolerance:1e-12},
      {name:'Burnout mass equals dry mass',error:Math.abs(r.burnout.m-p.dry),unit:'kg',tolerance:1e-12}
    ].map(x=>({...x,pass:x.error<=x.tolerance}));
  }
  const api={G,defaults,simulate,checks,mass,density};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.RocketPhysics=api;
})(typeof window==='undefined'?{}:window);
