import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(process.argv[2]);
const puppeteer=require('puppeteer-core');
const browser=await puppeteer.launch({executablePath:process.argv[3],headless:true,args:['--allow-file-access-from-files']});
try{
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(process.cwd()+'/index.html').href);
 console.log('Page diagnostics:',JSON.stringify(await page.evaluate(()=>({title:document.title,gsap:typeof gsap,timelines:Object.keys(window.__timelines||{}),url:location.href}))),errors);
 await page.waitForFunction(()=>Boolean(window.__timelines?.main));
 const report=await page.evaluate(async()=>{
  const tl=window.__timelines.main;
  function sample(t){tl.seek(t,true);return {space:document.getElementById('space').toDataURL(),spectrum:document.getElementById('spectrum').toDataURL(),history:document.getElementById('history').toDataURL(),subtitle:document.getElementById('subtitle').textContent};}
  sample(0);const introduction=document.querySelector('.heading').textContent;
  sample(7);const restFrequency=document.getElementById('freqValue').textContent;
  const a=sample(12),b=sample(16),c=sample(12),d=sample(27),e=sample(25),f=sample(27);
  sample(12);const synchronizedFrequency=document.getElementById('freqValue').textContent===Math.round(Doppler.received(8).frequency)+' Hz';
  const media=[];
  for(const el of document.querySelectorAll('audio')){if(el.readyState<1)await new Promise((resolve,reject)=>{el.addEventListener('loadedmetadata',resolve,{once:true});el.addEventListener('error',()=>reject(Error(el.src)),{once:true});el.load();});media.push({id:el.id,duration:el.duration,volume:Number(el.dataset.volume)});}
  return {introduction,restFrequency,toneStart:Number(document.getElementById('tone').dataset.start),synchronizedFrequency,backwardSeekIdentical:a.space===c.space&&a.spectrum===c.spectrum&&a.subtitle===c.subtitle,flybyChanges:a.space!==b.space&&a.spectrum!==b.spectrum,historySeekIdentical:d.history===f.history,historyReveals:d.history!==e.history,media};
 });
 assert.deepEqual(errors,[]);for(const key of ['backwardSeekIdentical','flybyChanges','historySeekIdentical','historyReveals'])assert.equal(report[key],true,key);
 assert.equal(report.introduction,'Why does a passing sound change pitch?');assert.equal(report.restFrequency,'440 Hz');assert.equal(report.toneStart,8);assert.equal(report.synchronizedFrequency,true);
 assert.equal(report.media.length,2);assert.ok(report.media.every(m=>Number.isFinite(m.duration)));
 fs.writeFileSync('verification-seeking.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
