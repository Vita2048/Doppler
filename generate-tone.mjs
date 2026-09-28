import './physics.js';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const ffmpeg=process.argv[2];
if(!ffmpeg) throw new Error('Pass the FFmpeg executable path.');
// Newton inversion of T=e+distance(source(e),mic)/c. Registers 0=e,1=q,2=dx,3=vx,4=r.
const step='st(1,max(0,ld(0)-4));st(2,90+if(lt(ld(1),1),40*ld(1)*ld(1),80*(ld(1)-0.5))-470);st(3,if(lt(ld(1),1),80*ld(1),80));st(4,sqrt(ld(2)*ld(2)+8100));st(0,ld(0)-(ld(0)+ld(4)/160-(t+4))/(1+ld(2)*ld(3)/(160*ld(4))));';
const expression='st(0,t+2);'+step.repeat(12)+'0.65*sin(2*PI*440*ld(0))*min(1,t/0.04)*min(1,(10-t)/0.08)';
fs.mkdirSync('assets',{recursive:true});
fs.writeFileSync('assets/tone-expression.txt',expression);
const result=spawnSync(ffmpeg,['-hide_banner','-y','-f','lavfi','-i',`aevalsrc='${expression}':s=48000:d=10`,'-c:a','pcm_s16le','assets/tone.wav'],{encoding:'utf8'});
if(result.status!==0) throw new Error(result.stderr);
console.log(result.stderr);
fs.writeFileSync('assets/frequency-history.json',JSON.stringify(Array.from({length:301},(_,i)=>({time:8+i/30,physicsTime:4+i/30,...Doppler.received(4+i/30)})),null,2));
