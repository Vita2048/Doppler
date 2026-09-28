import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const [ttsBin,ffmpeg,ffprobe]=process.argv.slice(2);
const parts=[
  [0,4.5,'+12%','This video explains the Doppler effect — why a passing sound changes pitch.'],
  [4.5,8,'+20%','At rest, the microphone hears the source’s own frequency.'],
  [8,13.8125,'+12%','As the source approaches, crests crowd together, so the microphone hears a higher pitch.'],
  [13.8125,18,'+10%','After passing, crests stretch apart, and the pitch drops.'],
  [18,24,'+18%','That shift is the Doppler effect. The source keeps the same note; motion changes how often crests arrive.'],
  [24,28,'+0%','This curve traces the changing frequency you just heard.']
];
function run(bin,args){const p=spawnSync(bin,args,{encoding:'utf8'});if(p.status!==0)throw new Error(p.stderr||String(p.error));return p.stdout;}
const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
const secs=s=>s.replace(',','.').split(':').reduce((n,x)=>n*60+Number(x),0);
let cues=[], inputs=[], filters=[];
fs.mkdirSync('assets/voice-parts',{recursive:true});
for(let i=0;i<parts.length;i++){
 const [start,end,rate,text]=parts[i], base=`assets/voice-parts/${i}`;
 fs.writeFileSync(base+'.txt',text);
  run(ttsBin,['--voice','en-US-AndrewNeural',`--rate=${rate}`,'--file',base+'.txt','--write-media',base+'.mp3','--write-subtitles',base+'.srt']);
 const duration=Number(run(ffprobe,['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',base+'.mp3']));
 if(duration>end-start)throw new Error(`Voice section ${i} is ${duration}s; available ${end-start}s`);
 const srt=fs.readFileSync(base+'.srt','utf8');
 for(const m of srt.matchAll(/(\d\d:\d\d:\d\d[,.]\d+) --> (\d\d:\d\d:\d\d[,.]\d+)\s*\n([^]*?)(?=\n\s*\n|$)/g))cues.push(`${stamp(start+secs(m[1]))} --> ${stamp(start+secs(m[2]))}\n${m[3].trim()}`);
 inputs.push('-i',base+'.mp3');filters.push(`[${i}:a]adelay=${Math.round(start*1000)}:all=1[a${i}]`);
 console.log(`Section ${i}: ${start}s + ${duration}s`);
}
filters.push(parts.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${parts.length}:normalize=0:duration=longest[out]`);
run(ffmpeg,['-hide_banner','-y',...inputs,'-filter_complex',filters.join(';'),'-map','[out]','-c:a','libmp3lame','-b:a','128k','assets/voice.mp3']);
fs.writeFileSync('assets/voice.vtt','WEBVTT\n\n'+cues.join('\n\n')+'\n');
fs.writeFileSync('script.txt',parts.map(p=>p[3]).join('\n\n')+'\n');
console.log('Final voice: '+run(ffprobe,['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1','assets/voice.mp3']));
