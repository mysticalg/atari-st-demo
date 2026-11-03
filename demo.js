const W=360,H=270,SX=20,SY=35,FPS=50;
const cv=document.getElementById('c'),cx=cv.getContext('2d'),img=cx.createImageData(W,H),px=img.data;
const IDX=new Uint8Array(W*H),PAL=new Float32Array(H*48);
let R=Math.random;function rnd(s){return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function fit(){const s=Math.min(innerWidth/W*1,innerHeight/H/(4/3)*1.3333);const w=Math.min(innerWidth,innerHeight*4/3);cv.style.width=w+'px';cv.style.height=(w*3/4)+'px'}
addEventListener('resize',fit);fit();
function hsv(h,s,v){h=((h%1)+1)%1*6;const i=h|0,f=h-i,p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));return[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6]}
function setp(y,i,c){const o=(y*16+i)*3;PAL[o]=c[0];PAL[o+1]=c[1];PAL[o+2]=c[2]}
// font strips
function strip(txt,s){const CH=2000,tw=txt.length*8+8,w=tw*s,h=8*s,m=new Uint8Array(w*h);
 for(let k=0;k<txt.length;k+=CH){const part=txt.slice(k,k+CH),c=document.createElement('canvas');c.width=part.length*8+8;c.height=8;const g=c.getContext('2d');g.font='8px P';g.fillStyle='#fff';g.textBaseline='top';g.fillText(part,0,0);
  const d=g.getImageData(0,0,c.width,8).data,ox=k*8;for(let y=0;y<h;y++)for(let x=0;x<(c.width-8)*s;x++)if(d[((y/s|0)*c.width+(x/s|0))*4+3]>127)m[y*w+ox*s+x]=1}
 return{m,w,h}}
let BIG,SMALL,LOGO,LOGO2;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=R()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
// scenes
const N=Math.floor(ENV.length*5);let SC=[];
function envAt(t){return ENV[Math.min(ENV.length-1,(t*10)|0)]}function oeAt(t){return OE[Math.min(OE.length-1,(t*10)|0)]}
function build(){const cuts=[0];let i=0;while(i<BEATS.length){const t=BEATS[i],e=envAt(t),near=DROPS.some(d=>Math.abs(t-d)<.3);
 if(t-cuts[cuts.length-1]>.2)cuts.push(t);if(e>.6&&!near&&i+1<BEATS.length)cuts.push((BEATS[i]+BEATS[i+1])/2);i+=near?4:(e>.45?1:2)}
 cuts.push(1e9);SC=[];for(let k=0;k<cuts.length-1;k++){const drop=DROPS.some(d=>Math.abs(cuts[k]-d)<.3);
 SC.push({t0:cuts[k],bg:R()*7|0,fg:R()*6|0,ov:R()<.45||drop,logo:drop||R()<.3,sym:R()<.12,scr:R()*4|0,seed:R()*1e6|0,drop,hue:R(),zoom:.7+R()*.7,cam:R()*2-1})}}
// effects
const S=Math.sin;
function bg(k,lt,sc){const h=sc.hue;let o=0;
 if(k==0){IDX.fill(0);const r=rnd(sc.seed);for(let y=0;y<H;y++){setp(y,0,[0,0,1.5]);for(let i=1;i<8;i++)setp(y,i,hsv(h,.25,15*i/7))}
  for(let n=0;n<500;n++){const X=r()*2-1,Y=r()*2-1,z=((r()*2+1-lt*.9*(1+envAt(T)))%2+2)%2+.05;const x=(X/z*120+W/2+sc.cam*40*S(lt))|0,y=(Y/z*120+H/2)|0;if(x>=0&&x<W&&y>=0&&y<H)IDX[y*W+x]=Math.max(1,Math.min(7,8-z*3.5|0))}}
 else if(k==1){for(let y=0;y<H;y++){for(let i=0;i<8;i++){const j=i<4?i:7-i;setp(y,i,hsv(h,.8,8*(j+1)/4))}
  for(let x=0;x<W;x++){const v=S(x/23+lt*2)+S(y/17-lt*1.3)+S((x+y)/31+lt)+S(Math.hypot(x-W/2-60*S(lt),y-H/2)/19);IDX[o++]=(((v+4)/8*8+lt*3)|0)&7}}}
 else if(k==2){const col=new Int8Array(H);for(let b=0;b<7;b++){const c=H/2+(H/2-12)*S(lt*1.7+b*.55);for(let y=0;y<H;y++){const d=Math.abs(y-c);if(d<10)col[y]=Math.max(col[y],Math.max(0,7-d*.7|0))}}
  for(let y=0;y<H;y++){IDX.fill(col[y],y*W,y*W+W);for(let i=0;i<8;i++)setp(y,i,hsv(h+i*.04,.7,i*1.9))}}
 else if(k==3){for(let y=0;y<H;y++){for(let i=0;i<4;i++){setp(y,i,hsv(h,.8,7*(i+1)/4));setp(y,i+4,hsv(h+.5,.8,8*(i+1)/4))}
  const off=18*S(y/14+lt*4)+10*S(y/37-lt*2);for(let x=0;x<W;x++){const X=x+off;IDX[o++]=(((Math.floor((X+lt*60)/24)+Math.floor((y+lt*30)/24))&1)*3+(Math.floor(X/6)&1))&7}}}
 else if(k==4){const ox=W/2+50*S(lt*.9),oy=H/2+30*S(lt*1.3);for(let y=0;y<H;y++){for(let i=0;i<4;i++){setp(y,i,hsv(h,.8,6*(i+1)/4));setp(y,i+4,hsv(h+.3,.8,8*(i+1)/4))}
  for(let x=0;x<W;x++){const dx=x-ox,dy=y-oy,r=Math.hypot(dx,dy),d=1800/(r+8),a=Math.atan2(dy,dx)/Math.PI*8;IDX[o++]=r<18?0:(((d+lt*12)|0)&1)*4+((((a+lt*2)|0)%4+4)%4)}}}
 else if(k==5){const a=lt*.7,z=.6+.4*S(lt*1.1),c=Math.cos(a),s=Math.sin(a);for(let y=0;y<H;y++){for(let i=0;i<4;i++){setp(y,i,hsv(h,.8,6*(i+1)/4));setp(y,i+4,hsv(h+.6,.8,9*(i+1)/4))}
  for(let x=0;x<W;x++){const X=x-W/2,Y=y-H/2,u=(X*c-Y*s)*z,v=(X*s+Y*c)*z,uu=((u%16)+16)%16-8,vv=((v%16)+16)%16-8;IDX[o++]=((Math.floor(u/16)+Math.floor(v/16))&1)*4+(uu*uu+vv*vv<25?3:0)}}}
 else{IDX.fill(0);const pr=[1,2,3,4,5,6,7,7,6,5,4,3,2,1];for(let y=0;y<H;y++){setp(y,0,[0,0,0]);for(let i=1;i<8;i++)setp(y,i,hsv(h+.2*i/7,.7,14*i/7));
  if(y)IDX.copyWithin(y*W,(y-1)*W,y*W);const x=(W/2-7+(W/2-20)*S(lt*2+y*.03)*S(lt*.7+y*.011))|0;for(let i=0;i<14;i++)if(x+i>=0&&x+i<W)IDX[y*W+x+i]=pr[i]}}}
// fg into IDX directly
function tri(a,b,c,col){let p=[a,b,c].sort((p,q)=>p[1]-q[1]);const[x0,y0]=p[0],[x1,y1]=p[1],[x2,y2]=p[2];
 for(let y=Math.max(0,Math.ceil(y0));y<=Math.min(H-1,y2);y++){const xa=x0+(x2-x0)*(y-y0)/(y2-y0||1);const xb=y<y1?x0+(x1-x0)*(y-y0)/(y1-y0||1):x1+(x2-x1)*(y-y1)/(y2-y1||1);
  let l=Math.max(0,Math.round(Math.min(xa,xb))),r=Math.min(W-1,Math.round(Math.max(xa,xb)));IDX.fill(col,y*W+l,y*W+r+1)}}
function disc(x,y,r,col){for(let j=Math.max(0,y-r|0);j<=Math.min(H-1,y+r);j++){const w=Math.sqrt(Math.max(0,r*r-(j-y)*(j-y)));const l=Math.max(0,Math.round(x-w)),rr=Math.min(W-1,Math.round(x+w));if(rr>=l)IDX.fill(col,j*W+l,j*W+rr+1)}}
function rot(a,b,c){const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cc=Math.cos(c),sc=Math.sin(c);return p=>{let[x,y,z]=p;[x,y]=[x*cc-y*sc,x*sc+y*cc];[x,z]=[x*cb+z*sb,-x*sb+z*cb];[y,z]=[y*ca-z*sa,y*sa+z*ca];return[x,y,z]}}
const PH=(1+Math.sqrt(5))/2;
const SOL=[{v:[[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]],f:[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]},
{v:[[1.4,0,0],[-1.4,0,0],[0,1.4,0],[0,-1.4,0],[0,0,1.4],[0,0,-1.4]],f:[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]]},
{v:[[-1,PH,0],[1,PH,0],[-1,-PH,0],[1,-PH,0],[0,-1,PH],[0,1,PH],[0,-1,-PH],[0,1,-PH],[PH,0,-1],[PH,0,1],[-PH,0,-1],[-PH,0,1]].map(p=>p.map(x=>x/1.3)),f:[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]}];
const SPH=[];for(let i=0;i<900;i++){const ph=Math.acos(1-2*(i+.5)/900),th=Math.PI*(1+Math.sqrt(5))*i;SPH.push([Math.sin(ph)*Math.cos(th),Math.sin(ph)*Math.sin(th),Math.cos(ph),ph])}
function fg(k,lt,sc){const o=oeAt(T),cx=W/2+70*S(lt*.8+sc.cam*3),cy=H/2+30*S(lt*1.1),zs=sc.zoom*(1+.15*o)*(sc.drop?1.3:1),Rm=rot(lt*1.3+sc.seed%7,lt*.9,lt*.5);
 if(k<3){const s=SOL[k],P=s.v.map(Rm),Sx=P.map(p=>[p[0]/(p[2]+4)*190*zs+cx,p[1]/(p[2]+4)*190*zs+cy]);const L=[.3,-.5,-.8].map(x=>x/1.0247);
  const fs=s.f.map(f=>{const a=P[f[0]],b=P[f[1]],c=P[f[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n);
   return{f,z:f.reduce((s,i)=>s+P[i][2],0)/f.length,l:Math.abs((n[0]*L[0]+n[1]*L[1]+n[2]*L[2])/l)}}).sort((a,b)=>b.z-a.z);
  for(const q of fs){const c=8+Math.min(4,(q.l*1.2*5)|0);for(let i=1;i<q.f.length-1;i++)tri(Sx[q.f[0]],Sx[q.f[i]],Sx[q.f[i+1]],c)}}
 else if(k==3){const pts=SPH.map(p=>{const m=1+.12*S(p[3]*6+lt*5)*o,q=Rm([p[0]*m,p[1]*m,p[2]*m]);return q}).sort((a,b)=>b[2]-a[2]);
  for(const q of pts){const Z=q[2]+3.2,x=q[0]/Z*230*zs+cx|0,y=q[1]/Z*230*zs+cy|0;if(x>=0&&x<W-1&&y>=0&&y<H-1){const c=Math.max(8,Math.min(12,8+(3.9-Z)/1.6*5|0));IDX[y*W+x]=IDX[y*W+x+1]=IDX[y*W+x+W]=IDX[y*W+x+W+1]=c}}}
 else if(k==4){const nb=24+(16*envAt(T)|0),ord=[...Array(nb).keys()].sort((a,b)=>S(lt*2+a*.6)-S(lt*2+b*.6));
  for(const b of ord){const x=cx+120*S(lt*1.7+b*.41)*zs,y=cy+70*S(lt*2.3+b*.27)*zs,r=7+3*S(lt*2+b*.6);[1,.75,.5,.25].forEach((s,k)=>disc(x-(1-s)*2,y-(1-s)*2,r*s,9+k))}}
 else{const th=48,ph=20,pts=[];for(let i=0;i<th;i++)for(let j=0;j<ph;j++){const T_=i/th*6.283,P_=j/ph*6.283;pts.push(Rm([(1.4+.5*Math.cos(P_))*Math.cos(T_),(1.4+.5*Math.cos(P_))*Math.sin(T_),.5*Math.sin(P_)]))}
  pts.sort((a,b)=>b[2]-a[2]);for(const q of pts){const Z=q[2]+4,x=q[0]/Z*260*zs+cx|0,y=q[1]/Z*260*zs+cy|0;if(x>=0&&x<W-1&&y>=0&&y<H-1){const c=Math.max(8,Math.min(12,8+(4.8-Z)*3|0));IDX[y*W+x]=IDX[y*W+x+1]=IDX[y*W+x+W]=IDX[y*W+x+W+1]=c}}}}
function line(x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/(n||1)|0,y=y0+(y1-y0)*i/(n||1)|0;if(x>=0&&x<W&&y>=0&&y<H)IDX[y*W+x]=c}}
function sym(k,x,y,s){const ring=()=>{for(let a=0;a<360;a+=2)line(x+s*Math.cos(a*.01745),y+s*Math.sin(a*.01745),x+s*Math.cos((a+2)*.01745),y+s*Math.sin((a+2)*.01745),14)};
 const poly=pts=>{for(let i=0;i<pts.length-1;i++)line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],14)};
 if(k==0){ring();poly([0,1,2,3,4,5].map(i=>[x+s*Math.sin(i*4*Math.PI/5),y-s*Math.cos(i*4*Math.PI/5)]))}
 else if(k==1){poly([[x,y-s],[x-s*.9,y+s*.6],[x+s*.9,y+s*.6],[x,y-s]]);disc(x,y+2,3,14)}
 else if(k==2){ring();poly([0,150,240,120,210,0].map(a=>[x+s*Math.sin(a*.01745),y-s*Math.cos(a*.01745)]))}
 else{ring();line(x-s*.4,y,x+s*.4,y,14);line(x,y-s*.4,x,y+s*.4,14)}}
function blit(st,x0,y0,col,offf){for(let x=0;x<st.w;x++){const X=x0+x;if(X<0||X>=W)continue;for(let y=0;y<st.h;y++){const Y=y0+y+(offf?offf(y):0);if(Y>=0&&Y<H&&st.m[y*st.w+x])IDX[Y*W+X]=col}}}
let T=0;
function frame(t){T=t;let k=0,lo=0,hi=SC.length-1;while(lo<=hi){const m=(lo+hi)>>1;if(SC[m].t0<=t){k=m;lo=m+1}else hi=m-1}
 const sc=SC[k],lt=t-sc.t0+sc.seed%100,e=envAt(t),r=rnd(sc.seed);
 bg(sc.bg,lt,sc);
 if(sc.sym)sym(sc.seed%4,W*(.25+.5*r()),H*(.3+.4*r()),40+30*r());
 fg(sc.fg,lt,sc);
 if(sc.logo){const L=sc.seed%3?LOGO:LOGO2,ly=20+10*S(lt*2)|0,lx=(W-L.w)/2+40*S(lt*1.3)|0;for(let y=0;y<L.h;y++){const xs=lx+(sc.drop?6*S(y/6+lt*5)|0:0);for(let x=0;x<L.w;x++){const X=xs+x;if(X>=0&&X<W&&L.m[y*L.w+x])IDX[(ly+y)*W+X]=13}}
  for(let y=0;y<H;y++)setp(y,13,hsv(sc.hue+.5+y/90+t*.2,.6,15))}
 const sp=t*FPS*4|0;
 if(sc.scr<3){const amp=[50,25,70][sc.scr],base=sc.scr!=1?H/2-16:110;for(let c=0;c<W;c++){const off=base+amp*S((c+sp)/57+t*2)*(.6+.4*e)|0,sx=(c+sp)%BIG.w;for(let y=0;y<32;y++){const Y=off+y;if(Y>=0&&Y<H&&BIG.m[y*BIG.w+sx])IDX[Y*W+c]=15}}}
 const sps=t*FPS*3|0,Y0=SY+200-18;for(let c=0;c<W;c++){const sx=(c+sps)%SMALL.w;for(let y=0;y<16;y++)if(SMALL.m[y*SMALL.w+sx])IDX[(Y0+y)*W+c]=15}
 for(let y=0;y<H;y++){setp(y,15,(y>=Y0&&y<Y0+16)?hsv(.55,.3,15):hsv(.12+y/180+t*.05,.5,15));[4,6.5,9,12,15].forEach((v,i)=>setp(y,8+i,hsv(sc.hue+.33,.75,v)));const o=(y*16)*3,c=hsv(sc.hue+.1,.5,2.5);setp(y,14,[PAL[o]+c[0],PAL[o+1]+c[1],PAL[o+2]+c[2]])}
 for(let y=0,o=0;y<H;y++){const inY=y>=SY&&y<SY+200;let bc=null;if(!sc.ov)bc=sc.bg==2?hsv(sc.hue+y/H*.3,.6,2+1.5*S(y/9+t*3)):[0,0,1];
  for(let x=0;x<W;x++,o++){let c;if(bc&&!(inY&&x>=SX&&x<SX+320))c=bc;else{const p=(y*16+IDX[o])*3;c=[PAL[p],PAL[p+1],PAL[p+2]]}
   px[o*4]=Math.min(15,Math.round(c[0]))*17;px[o*4+1]=Math.min(15,Math.round(c[1]))*17;px[o*4+2]=Math.min(15,Math.round(c[2]))*17;px[o*4+3]=255}}
 cx.putImageData(img,0,0)}
const au=document.getElementById('a');
document.getElementById('go').onclick=async()=>{await document.fonts.load('8px P');document.getElementById('go').remove();
 const st=shuffle(MSGS).join('    ***    '),st2=shuffle(MSGS).join('    ***    ');BIG=strip(st.slice(0,24000),4);SMALL=strip(st2.slice(0,24000),2);LOGO=strip('MYSTICALG',4);LOGO2=strip('ST',8);
 build();au.play();const loop=()=>{frame(au.currentTime);if(!au.ended)requestAnimationFrame(loop)};loop()};
au.onended=()=>{};
