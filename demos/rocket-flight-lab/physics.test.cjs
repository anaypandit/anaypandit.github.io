const assert=require('node:assert/strict');
const R=require('./physics.js');
for(const c of R.checks()) {assert.ok(c.pass,`${c.name}: ${c.error} > ${c.tolerance}`);console.log(`PASS ${c.name}: ${c.error.toExponential(3)} ${c.unit}`);}
const nominal=R.simulate();
assert.ok(nominal.landed);assert.ok(nominal.flying);assert.equal(nominal.rows.at(-1).h,0);
assert.ok(nominal.rows.every(r=>r.m>=nominal.p.dry && r.h>=0 && Object.values(r).every(v=>typeof v!=='number'||Number.isFinite(v))));
assert.ok(R.simulate({drag:false}).apogee.h>nominal.apogee.h);
assert.throws(()=>R.simulate({dry:0}));assert.throws(()=>R.simulate({dt:NaN}));
const delayed=R.simulate({thrust:45});assert.ok(delayed.flying && delayed.rows.some(r=>r.phase==='On pad'&&r.t>0));
const extreme=R.simulate({dry:0.1,prop:0.1,thrust:10000,burn:60,area:0,drag:false});
assert.ok(extreme.truncated);assert.ok(extreme.rows.every(r=>Number.isFinite(r.h)));
console.log(JSON.stringify({apogee:nominal.apogee,flightTime:nominal.rows.at(-1).t,rows:nominal.rows.length,allChecksPassed:true},null,2));
