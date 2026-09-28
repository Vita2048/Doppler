(function (scope) {
  const f = 440, c = 160, speed = 80, mic = {x:470,y:305};
  function source(t) {
    const q = Math.max(0, t-4);
    return {x:90 + (q<1 ? 40*q*q : 80*(q-.5)), y:215,
      vx:q<1 ? 80*q : 80};
  }
  function received(t) {
    let e=t-2;
    for(let i=0;i<12;i++) {
      const p=source(e), dx=p.x-mic.x, dy=p.y-mic.y, r=Math.hypot(dx,dy);
      e-=(e+r/c-t)/(1+dx*p.vx/(c*r));
    }
    const p=source(e), r=Math.hypot(mic.x-p.x,mic.y-p.y);
    const radial=p.vx*(mic.x-p.x)/r;
    return {emission:e,frequency:f*c/(c-radial),radial,distance:r};
  }
  scope.Doppler={f,c,speed,mic,source,received,passReceived:9.8125};
})(globalThis);
