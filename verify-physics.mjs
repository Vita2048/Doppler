import './physics.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const D=Doppler;
let residual=0,derivativeError=0;
for(let t=0;t<=14;t+=1/120){
 const a=D.received(t),p=D.source(a.emission);
 residual=Math.max(residual,Math.abs(a.emission+Math.hypot(p.x-D.mic.x,p.y-D.mic.y)/D.c-t));
 const derivative=D.f*(D.received(t+1e-5).emission-D.received(t-1e-5).emission)/2e-5;
 derivativeError=Math.max(derivativeError,Math.abs(a.frequency-derivative));
 assert.ok(a.frequency>0&&Number.isFinite(a.frequency));
}
assert.ok(residual<1e-8);assert.ok(derivativeError<.02);
assert.ok(Math.abs(D.received(D.passReceived).frequency-440)<1e-6);
const wav=fs.readFileSync('assets/tone.wav');let offset=12,data,rate;
while(offset<wav.length){const tag=wav.toString('ascii',offset,offset+4),size=wav.readUInt32LE(offset+4);if(tag==='fmt ')rate=wav.readUInt32LE(offset+12);if(tag==='data')data=wav.subarray(offset+8,offset+8+size);offset+=8+size+(size%2);}
assert.equal(rate,48000);assert.equal(data.length/2/rate,10);
const results=[];
for(const time of [4.5,6.8,7.5,8,9,9.8125,10.5,12,13.5]){
 const sample=(time-4)*rate, crossings=[];
 for(let j=Math.floor(sample-0.025*rate);j<sample+0.025*rate;j++){
  const a=data.readInt16LE(j*2),b=data.readInt16LE((j+1)*2);
  if(a<=0&&b>0)crossings.push(j-a/(b-a));
 }
 assert.ok(crossings.length>5);
 const measured=(crossings.length-1)*rate/(crossings.at(-1)-crossings[0]);
 const mid=(crossings[0]+crossings.at(-1))/2/rate+4,expected=D.received(mid).frequency;
 assert.ok(Math.abs(measured-expected)<1,`Audio/model mismatch at ${time}: ${measured} vs ${expected}`);
 results.push({time,measured,expected,error:Math.abs(measured-expected)});
}
const report={travelTimeResidual:residual,phaseDerivativeErrorHz:derivativeError,rate,duration:10,samples:results};
fs.writeFileSync('verification-physics.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
