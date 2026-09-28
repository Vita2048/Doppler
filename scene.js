const D=Doppler, mint='#77edcc', amber='#ffc878', white='#eef4ff', dim='#a8b9d0';
const space=document.getElementById('space').getContext('2d');
const spectrum=document.getElementById('spectrum').getContext('2d');
const history=document.getElementById('history').getContext('2d');
function line(ctx,x1,y1,x2,y2,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function text(ctx,s,x,y,color=dim,size=23,align='left'){ctx.font=`${size}px sans-serif`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(s,x,y);}
function dot(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function waveScene(t,paused){
 const ctx=space;ctx.clearRect(0,0,844,480);
 // Pre-roll ensures a stationary field already reaches the microphone at t=0.
 for(let birth=-8;birth<=t;birth+=.4){
  const age=t-birth;if(age>8)continue;
  const p=D.source(birth),r=D.c*age;
  ctx.strokeStyle=`rgba(119,237,204,${.10+.48*(1-age/8)})`;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(p.x,p.y,r,0,2*Math.PI);ctx.stroke();
 }
 line(ctx,40,215,807,215,'#32445c',1); // source path
 const p=D.source(t), received=D.received(t), old=D.source(received.emission);
 line(ctx,old.x,old.y,D.mic.x,D.mic.y,'#ffc878',2);
 dot(ctx,old.x,old.y,5,amber);
 dot(ctx,p.x,p.y,15,mint);dot(ctx,p.x,p.y,6,'#102630');
 text(ctx,'SOURCE',Math.max(65,Math.min(765,p.x)),p.y-33,mint,21,'center');
 const phase=((received.emission/.4)%1+1)%1;
 const pulse=Math.exp(-Math.pow(Math.min(phase,1-phase)/.10,2));
 dot(ctx,470,305,24+pulse*10,`rgba(255,200,120,${.12+.25*pulse})`);
 ctx.fillStyle=amber;ctx.beginPath();ctx.roundRect(461,291,18,27,9);ctx.fill();
 ctx.strokeStyle=amber;ctx.lineWidth=3;ctx.beginPath();ctx.arc(470,305,16,0,Math.PI);ctx.stroke();
 line(ctx,470,321,470,336,amber,3);line(ctx,458,336,482,336,amber,3);
 text(ctx,'MIC',470,369,amber,23,'center');
 text(ctx,'emitted 440 Hz',35,445,mint,24);
 if(paused){
  text(ctx,'stretched',180,94,mint,25,'center');text(ctx,'packed',525,94,amber,25,'center');
  line(ctx,202,105,235,145,mint);line(ctx,520,105,490,160,amber);
 }
}
function spectrumScene(t){
 const ctx=spectrum;ctx.clearRect(0,0,844,480);
 const x=f=>70+(f-200)/700*704, bottom=355;
 for(let f=200;f<=900;f+=100){line(ctx,x(f),150,x(f),bottom,'#22334b',1);text(ctx,String(f),x(f),397,dim,21,'center');}
 line(ctx,70,bottom,774,bottom,dim);
 const rest=x(440), recv=D.received(t).frequency, peak=x(recv);
 ctx.setLineDash([6,7]);line(ctx,rest,135,rest,bottom,'#8195b0',2);ctx.setLineDash([]);
 text(ctx,'rest f',rest,122,dim,23,'center');
 ctx.fillStyle='#ffc87822';ctx.beginPath();ctx.moveTo(peak-20,bottom);ctx.lineTo(peak,166);ctx.lineTo(peak+20,bottom);ctx.fill();
 line(ctx,peak,bottom,peak,167,amber,5);dot(ctx,peak,166,7,amber);
 text(ctx,`${Math.round(recv)} Hz`,774,72,amber,64,'right');
 text(ctx,'frecv',70,72,white,29);
 text(ctx,'frequency / Hz',774,450,dim,22,'right');
 text(ctx,recv>445?'higher pitch  →':recv<435?'←  lower pitch':'same frequency',70,450,amber,24);
 document.getElementById('freqValue').textContent=Math.round(recv)+' Hz';
}
function historyScene(t){
 const ctx=history;ctx.clearRect(0,0,1760,450);
 const x=s=>105+(s-4)/10*1550,y=f=>342-(f-250)/600*270;
 for(let f=300;f<=800;f+=100){line(ctx,105,y(f),1655,y(f),'#263750',1);text(ctx,String(f),80,y(f)+7,dim,23,'right');}
 for(let s=4;s<=14;s+=2){line(ctx,x(s),60,x(s),342,'#263750',1);text(ctx,`${s+4} s`,x(s),382,dim,23,'center');}
 ctx.setLineDash([8,8]);line(ctx,105,y(440),1655,y(440),'#8ba0bb',2);ctx.setLineDash([]);
 text(ctx,'emitted / 440 Hz',1645,y(440)-14,mint,23,'right');
 const limit=4+10*Math.min(1,Math.max(0,(t-24)/2.8));
 ctx.strokeStyle=amber;ctx.lineWidth=5;ctx.beginPath();
 for(let s=4;s<=limit+.0001;s+=.0125){const yy=y(D.received(s).frequency);if(s===4)ctx.moveTo(x(s),yy);else ctx.lineTo(x(s),yy);}ctx.stroke();
 dot(ctx,x(limit),y(D.received(limit).frequency),7,amber);
 text(ctx,'received frequency / Hz',105,35,amber,25);
 text(ctx,'time at the microphone',1655,430,dim,23,'right');
 text(ctx,'APPROACH',620,35,mint,23,'center');text(ctx,'RECEDE',1380,35,amber,23,'center');
 if(t>26){const xp=x(D.passReceived);line(ctx,xp,80,xp,342,'#8195b0',1);text(ctx,'pass reaches mic',xp+16,95,dim,21);}
}
function update(t){
 const sim=t>=18?8:t-4;
 if(t<24){waveScene(sim,t>=18);spectrumScene(sim);}
 if(t>=24&&t<28)historyScene(t);
 document.querySelector('.heading').textContent=t<4.5?'Why does a passing sound change pitch?':'Doppler is a moving spectrum.';
 document.getElementById('phaseLabel').textContent=t<4.5?'01 / THE QUESTION':t<8?'02 / AT REST':t<18?'03 / THE FLY-BY':t<24?'04 / NAME THE EFFECT':t<28?'05 / THE PASS, RECORDED':'06 / DOPPLER';
 const cue=window.captionCues.find(c=>t>=c.start&&t<c.end);
 document.getElementById('subtitle').textContent=cue?cue.text:'';
}
// A property setter is called even when seek suppresses GSAP event callbacks.
const clockState={};let compositionTime=0;
Object.defineProperty(clockState,'time',{get(){return compositionTime;},set(t){compositionTime=t;update(t);}});
const tl=gsap.timeline({paused:true});
tl.to(clockState,{time:30,duration:30,ease:'none'},0);
tl.fromTo('#progress',{scaleX:0},{scaleX:1,duration:30,ease:'none'},0);
window.__timelines=window.__timelines||{};
window.__timelines.main=tl;
update(0);
