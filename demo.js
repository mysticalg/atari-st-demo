// INFINITE DIMENSIONS - Atari ST demo (browser). 360x270 incl. borders, 16 colours per scanline from 4096. Synced to audio.currentTime.
const W=360,H=270,SX=20,SY=35,FPS=50;
const cv=document.getElementById('c'),cx=cv.getContext('2d'),img=cx.createImageData(W,H),px=img.data;
const IDX=new Uint8Array(W*H),FG=new Uint8Array(W*H),PAL=new Float32Array(H*48),FB=new Float32Array(W*H);
const S=Math.sin,C=Math.cos,PI=Math.PI;
function fit(){const w=Math.min(innerWidth,innerHeight*4/3);cv.style.width=w+'px';cv.style.height=(w*3/4)+'px'}addEventListener('resize',fit);fit();
function rnd(s){s=s>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function hsv(h,s,v){h=((h%1)+1)%1*6;const i=h|0,f=h-i,p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));return[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6]}
function setp(y,i,c){const o=(y*16+i)*3;PAL[o]=c[0];PAL[o+1]=c[1];PAL[o+2]=c[2]}
function ramp(y,i0,h,n,vmax,s=.8,h2){h2=h2===undefined?h:h2;for(let k=0;k<n;k++)setp(y,i0+k,hsv(h+(h2-h)*k/Math.max(1,n-1),s,vmax*(k+1)/n))}
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>v/16);const bay=(x,y)=>B4[(y&3)*4+(x&3)];
const ga=(a,t)=>a[Math.min(a.length-1,Math.max(0,(t*25)|0))];
// fonts
function strip(txt,s){const CH=2000,tw=txt.length*8+8,w=tw*s,h=8*s,m=new Uint8Array(w*h);
 for(let k=0;k<txt.length;k+=CH){const part=txt.slice(k,k+CH),c=document.createElement('canvas');c.width=part.length*8+8;c.height=8;const g=c.getContext('2d');g.font='8px P';g.fillStyle='#fff';g.textBaseline='top';g.fillText(part,0,0);
  const d=g.getImageData(0,0,c.width,8).data,ox=k*8;for(let y=0;y<h;y++)for(let x=0;x<(c.width-8)*s;x++)if(d[((y/s|0)*c.width+(x/s|0))*4+3]>127)m[y*w+ox*s+x]=1}return{m,w,h}}
let BIG,SMALL,LOGO;
function mklogo(){const l1=strip('INFINITE',4),l2=strip('DIMENSIONS',4),lw=336,lh=78,m=new Uint8Array(lw*lh),o=new Uint8Array(lw*lh);
 for(let y=0;y<32;y++){for(let x=0;x<256;x++)if(l1.m[y*l1.w+x])m[(y+2)*lw+40+x]=1;for(let x=0;x<320;x++)if(l2.m[y*l2.w+x])m[(y+40)*lw+8+x]=1}
 for(let y=0;y<lh;y++)for(let x=0;x<lw;x++){if(m[y*lw+x]){o[y*lw+x]=(y<2||!m[(y-1)*lw+x])&&(y<3||!m[(y-2)*lw+x])?12:13;continue}
  let d=0;for(let dy=-2;dy<=2&&!d;dy++)for(let dx=-2;dx<=2;dx++){const Y=y+dy,X=x+dx;if(Y>=0&&Y<lh&&X>=0&&X<lw&&m[Y*lw+X]){d=1;break}}
  if(!d&&y>=3&&x>=3&&m[(y-3)*lw+x-3])d=1;if(d)o[y*lw+x]=14}return{o,w:lw,h:lh}}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
// beat grid (follows detected beat times, not fixed BPM)
const BARS=BEATS.filter((_,i)=>i>=D0&&(i-D0)%4==0);
function beatinfo(t){let lo=0,hi=BEATS.length-1,i=-1;while(lo<=hi){const m=(lo+hi)>>1;if(BEATS[m]<=t){i=m;lo=m+1}else hi=m-1}
 if(i<0)return[0,0,0,0,1];const nx=i+1<BEATS.length?BEATS[i+1]:BEATS[i]+.43;return[i,(t-BEATS[i])/(nx-BEATS[i]),((i-D0)%4+4)%4,Math.floor((i-D0)/4),Math.exp(-(t-BEATS[i])*7)]}
let RUN=1;const cut=s=>{s=s.slice(0,24000);return s.slice(0,s.lastIndexOf('***')+3)+'    '};const cache=new Map();
function scene(t){const[i,frac,bib,bar,P]=beatinfo(t);const bt0=bar>=0?BARS[Math.min(BARS.length-1,bar)]:0;
 let eb=0;for(let k=0;k<43;k++)eb+=ga(ENV,bt0+k/25);eb/=43;const drop=DROPS.some(d=>Math.abs(d-bt0)<1.8);
 let sub=drop?0:eb>.5?bib:eb>.3?bib>>1:0;const key=bar*4+sub;let sc=cache.get(key);
 if(!sc){const r=rnd(bar*7919+11+RUN*977),r2=rnd(bar*104729+sub*31+5+RUN*131),rp=rnd(Math.floor(bar/8)*31337+1+RUN);r();r2();rp();
  let bg=r()*11|0;if(eb>.7&&sub>=2)bg=[1,3,4,5,7,10][r2()*6|0];const fg=r2()*9|0;
  sc={key,bg,fg,ov:drop||r()<.5||fg==8,logo:drop||r()<.3||((bar%8)+8)%8==0,sym:r2()<.12,scr:r2()*4|0,seed:r2()*1e9|0,drop,hue:rp()+.09*(((bar%8)+8)%8),zoom:.8+r2()*.5,cam:r2()*2-1};cache.set(key,sc)}
 return[sc,i,frac,bib,bar,P]}
// textures
const TEX=new Uint8Array(64*64);
// heightmap
const HM=new Float32Array(256*256);(()=>{const r=rnd(3);for(let k=1;k<6;k++){const n=(1<<k)+1,g=[];for(let i=0;i<n*n;i++)g.push(r());
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const fx=x/256*(n-1),fy=y/256*(n-1),ix=fx|0,iy=fy|0,ax=fx-ix,ay=fy-iy,sx=ax*ax*(3-2*ax),sy=ay*ay*(3-2*ay);
  const v=g[iy*n+ix]*(1-sx)*(1-sy)+g[iy*n+ix+1]*sx*(1-sy)+g[(iy+1)*n+ix]*(1-sx)*sy+g[(iy+1)*n+ix+1]*sx*sy;HM[y*256+x]+=v/k}}
 let mn=1e9,mx=-1e9;for(const v of HM){mn=Math.min(mn,v);mx=Math.max(mx,v)}for(let i=0;i<HM.length;i++)HM[i]=(HM[i]-mn)/(mx-mn)})();
let T=0,ST=null;
function bg(k,t,B,sc,P){const h=sc.hue,e=ga(ENV,t),kick=ga(KICK,t),sn=ga(SNR,t);let o=0;
 if(k==0){IDX.fill(0);for(let y=0;y<H;y++){setp(y,0,[0,0,1.5]);ramp(y,1,h,7,15,.3)}const r=rnd(sc.seed%9999+1),sp=.5+1.5*e,cx=W/2+sc.cam*50*S(B*.25),cy=H/2+20*S(B*.17);
  for(let n=0;n<400;n++){const X=r()*2-1,Y=r()*2-1,Z=r()*2-1;for(let tr=0;tr<6;tr++){const z=((Z+1-(t-tr*.012*(1+3*P))*sp)%2+2)%2+.05,x=(X/z*130+cx)|0,y=(Y/z*130+cy)|0;
   if(x>=0&&x<W&&y>=0&&y<H){const c=Math.max(1,Math.min(7,(8-z*3.5-tr)|0));if(c>IDX[y*W+x])IDX[y*W+x]=c}}}}
 else if(k==1){const ph=B*.6,cx2=W/2+60*S(ph);for(let y=0;y<H;y++){ramp(y,0,h,4,8);for(let i=0;i<4;i++){const q=(4+i)*3,p=(3-i)*3;setp(y,4+i,[PAL[(y*16)*3+p],PAL[(y*16)*3+p+1],PAL[(y*16)*3+p+2]])}
  for(let x=0;x<W;x++){const v=S(x/23+ph*2)+S(y/17-ph*1.3)+S((x+y)/31+ph)+S(Math.hypot(x-cx2,y-H/2)/(19-6*kick));IDX[o++]=(((v+4)/8*7.99+bay(x,y)*.9+B)|0)&7}}}
 else if(k==2){const col=new Int8Array(H);for(let b=0;b<9;b++){const c=H/2+(H/2-12)*S(B*.9+b*.5)-P*30*C(b);for(let y=0;y<H;y++){const d=Math.abs(y-c);if(d<11)col[y]=Math.max(col[y],Math.max(0,7-d*.65|0))}}
  for(let y=0;y<H;y++){IDX.fill(col[y],y*W,y*W+W);for(let b=0;b<8;b++)setp(y,b,hsv(h+b*.04+y/600,.7,b*1.9))}}
 else if(k==3){const amp=12+40*sn+10*P;for(let y=0;y<H;y++){ramp(y,0,h,4,7);ramp(y,4,h+.5,4,8);const off=amp*S(y/14+B*2)+10*S(y/37-B);
  for(let x=0;x<W;x++){const X=x+off;IDX[o++]=((((Math.floor((X+B*24)/24)+Math.floor((y+B*12)/24))&1)*4+(Math.floor(X/6)&1)*2+(bay(x,y)>.5))&7)}}}
 else if(k==4){const ox=W/2+50*S(B*.4),oy=H/2+30*S(B*.6);for(let y=0;y<H;y++){ramp(y,0,h,4,6);ramp(y,4,h+.3,4,8);
  for(let x=0;x<W;x++){const dx=x-ox,dy=y-oy,r=Math.hypot(dx,dy),d=2000/(r+8)*(1+.15*P),a=Math.atan2(dy,dx)/PI*8;IDX[o++]=r<14?0:(((d+B*4)|0)&1)*4+((((a+B)|0)%4+4)%4)}}}
 else if(k==5){const a=B*.35,z=.35+.3*S(B*.25)-.1*P,c=C(a),s=S(a);for(let y=0;y<H;y++){ramp(y,0,h,4,6);ramp(y,4,h+.6,4,11);
  for(let x=0;x<W;x++){const X=x-W/2,Y=y-H/2,u=(X*c-Y*s)*z+B*8,v=(X*s+Y*c)*z;IDX[o++]=TEX[((v|0)&63)*64+((u|0)&63)]*3+1+(bay(x,y)>.7)}}}
 else if(k==6){IDX.fill(0);const pr=[1,2,3,4,5,6,7,7,6,5,4,3,2,1];for(let y=0;y<H;y++){setp(y,0,[0,0,0]);ramp(y,1,h,7,14,.7,h+.2);
  if(y)IDX.copyWithin(y*W,(y-1)*W,y*W);const x=(W/2-7+(W/2-20)*S(B*.8+y*.03*(1+P*.3))*S(B*.3+y*.011))|0;for(let i=0;i<14;i++)if(x+i>=0&&x+i<W)IDX[y*W+x+i]=pr[i]}}
 else if(k==7){const bs=[];for(let b=0;b<6;b++)bs.push([W/2+130*S(B*.31+b*1.7),H/2+90*S(B*.23+b*2.3)]);const r2=(28+12*P)**2;
  for(let y=0;y<H;y++){setp(y,0,[0,0,1]);ramp(y,1,h,7,15,.6,h+.25);for(let x=0;x<W;x++){let f=0;for(const b of bs)f+=r2/((x-b[0])**2+(y-b[1])**2+1);IDX[o++]=Math.min(7,(f*3.2+bay(x,y)*.8)|0)}}}
 else if(k==8){IDX.fill(0);const ymin=new Int16Array(W).fill(H),cam=B*6,ang=.4*S(B*.1),hor=90+10*S(B*.2)-6*P,ca=C(ang),sa=S(ang);
  for(let y=0;y<H;y++){setp(y,0,hsv(h+.55,.6,1+y/H*7));ramp(y,1,h+.25,7,13,.6)}
  for(let zi=1;zi<90;zi++){const z=zi*1.6+zi*zi*.02;for(let x=0;x<W;x++){const cs=-1+2*x/(W-1),sx=((cs*ca*z-z*sa*.5+128)%256+256)%256,sy=((cam+z*ca+cs*z*sa)%256+256)%256,hh=HM[(sy|0)*256+(sx|0)];
   const ys=Math.max(0,Math.min(H,(hor+(60-hh*90)/z*12)|0)),col=Math.max(1,Math.min(7,((hh*6+1)|0)-(zi>60)));for(let y=ys;y<ymin[x];y++)IDX[y*W+x]=col;if(ys<ymin[x])ymin[x]=ys}}}
 else if(k==9){const sx=B*10;IDX.fill(0);const L=[[.3,110,25,.02],[.6,135,30,.035],[1,160,25,.05]];
  for(let x=0;x<W;x++)L.forEach(([sp,base,amp,fr],l)=>{const X=x+sx*sp*4,top=base-amp*(S(X*fr)+.5*S(X*fr*2.3+l));for(let y=Math.max(0,top|0);y<H;y++)IDX[y*W+x]=1+l*2+(bay(x,y)>.8)});
  for(let y=190;y<H;y++){const zf=1/(y-185),st=((zf*400+sx*2)%2)>1;IDX.fill(st?6:7,y*W,y*W+W)}
  for(let y=0;y<H;y++){setp(y,0,hsv(h+.6-y/900,.7,y<190?2+y/190*9:2));ramp(y,1,h+.75,6,10,.5);if(y>=190){setp(y,6,hsv(h+.3,.6,4+Math.min(8,(y-190)/9)));setp(y,7,hsv(h+.3,.6,2+Math.min(6,(y-190)/12)))}}}
 else{for(let y=0;y<H;y++){const hh=h+y/H*.6+.08*S(B*.5+y/40);ramp(y,0,hh,8,8,.85,hh+.4);for(let x=0;x<W;x++)IDX[o++]=((x/W*7+.5*S(y/25+B*.5)+bay(x,y)*.95)|0)&7}}}
// 3D
function rot(a,b,c){const ca=C(a),sa=S(a),cb=C(b),sb=S(b),cc=C(c),s_=S(c);return p=>{let[x,y,z]=p;[x,y]=[x*cc-y*s_,x*s_+y*cc];[x,z]=[x*cb+z*sb,-x*sb+z*cb];[y,z]=[y*ca-z*sa,y*sa+z*ca];return[x,y,z]}}
const PH=(1+Math.sqrt(5))/2;
const SOL=[{v:[[-1,-1,-1],[-1,-1,1],[-1,1,-1],[-1,1,1],[1,-1,-1],[1,-1,1],[1,1,-1],[1,1,1]],f:[[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]},
{v:[[1.5,0,0],[-1.5,0,0],[0,1.5,0],[0,-1.5,0],[0,0,1.5],[0,0,-1.5]],f:[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]]},
{v:[[-1,PH,0],[1,PH,0],[-1,-PH,0],[1,-PH,0],[0,-1,PH],[0,1,PH],[0,-1,-PH],[0,1,-PH],[PH,0,-1],[PH,0,1],[-PH,0,-1],[-PH,0,1]].map(p=>p.map(x=>x/1.3)),f:[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]}];
const LT=[.4,-.6,-.7].map(v=>v/Math.hypot(.4,.6,.7));const shade=n=>.18+.82*Math.max(0,-(n[0]*LT[0]+n[1]*LT[1]+n[2]*LT[2]));
const TOR={P:[],N:[],f:[]};(()=>{const nu=28,nv=14;for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const u=i/nu*2*PI,v=j/nv*2*PI;TOR.P.push([(1.25+.55*C(v))*C(u),(1.25+.55*C(v))*S(u),.55*S(v)]);TOR.N.push([C(v)*C(u),C(v)*S(u),S(v)]);
 TOR.f.push([i*nv+j,((i+1)%nu)*nv+j,((i+1)%nu)*nv+(j+1)%nv,i*nv+(j+1)%nv])}})();
const SPH=[],CUB=[],TRS=[];for(let i=0;i<1200;i++){const ph=Math.acos(1-2*(i+.5)/1200),th=PI*(1+Math.sqrt(5))*i,p=[S(ph)*C(th),S(ph)*S(th),C(ph)],m=Math.max(...p.map(Math.abs));SPH.push(p);CUB.push(p.map(v=>v/m));
 const U=th%(2*PI),V=ph*2;TRS.push([(1.2+.5*C(V))*C(U),(1.2+.5*C(V))*S(U),.5*S(V)])}
function gtri(p,I,uv,glenz,spec){const x0=Math.max(0,Math.floor(Math.min(p[0][0],p[1][0],p[2][0]))),x1=Math.min(W-1,Math.ceil(Math.max(p[0][0],p[1][0],p[2][0]))),y0=Math.max(0,Math.floor(Math.min(p[0][1],p[1][1],p[2][1]))),y1=Math.min(H-1,Math.ceil(Math.max(p[0][1],p[1][1],p[2][1])));
 const[ax,ay]=p[0],[bx,by]=p[1],[cx_,cy_]=p[2],d=(by-cy_)*(ax-cx_)+(cx_-bx)*(ay-cy_);if(Math.abs(d)<1e-6)return;
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const X=x+.5,Y=y+.5,w0=((by-cy_)*(X-cx_)+(cx_-bx)*(Y-cy_))/d,w1=((cy_-ay)*(X-cx_)+(ax-cx_)*(Y-cy_))/d,w2=1-w0-w1;
  if(w0<-.01||w1<-.01||w2<-.01)continue;if(glenz&&((x+y)&1))continue;let I_=w0*I[0]+w1*I[1]+w2*I[2];
  if(uv){const u=w0*uv[0][0]+w1*uv[1][0]+w2*uv[2][0],v=w0*uv[0][1]+w1*uv[1][1]+w2*uv[2][1],tx=TEX[(((v*63)|0)&63)*64+(((u*63)|0)&63)];I_*=tx==0?.62:tx==2?1.15:1}
  if(spec)I_+=Math.max(0,I_-.75)*2.5;FG[y*W+x]=8+Math.max(0,Math.min(4,(I_*4.2+bay(x,y)-.5)|0))}}
function fg(k,t,B,sc,P){const e=ga(ENV,t),kick=ga(KICK,t),sn=ga(SNR,t),cx=W/2+70*S(B*.35+sc.cam*3),cy=H/2+25*S(B*.27),zs=sc.zoom*(1+.28*P*(.4+e)+.1*kick)*(sc.drop?1.25:1),R=rot(B*.55+sc.seed%7,B*.4+P*.3,B*.22);
 if(k<3||k==7){const sk=k<3?k:(sc.seed%2)*2,s=SOL[sk],P3=s.v.map(R),Sx=P3.map(p=>[p[0]/(p[2]+4.2)*200*zs+cx,p[1]/(p[2]+4.2)*200*zs+cy]),VN=s.v.map(v=>{const l=Math.hypot(...v);return R(v.map(q=>q/l))});
  const fs=s.f.slice().sort((a,b)=>b.reduce((s,i)=>s+P3[i][2],0)/b.length-a.reduce((s,i)=>s+P3[i][2],0)/a.length);
  for(const fc of fs){const a=P3[fc[0]],b=P3[fc[1]],c=P3[fc[2]],u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n);n=n.map(q=>q/l);
   if(n[0]*a[0]+n[1]*a[1]+n[2]*(a[2]+4.2)>0)n=n.map(q=>-q);const s0=Sx[fc[0]],s1=Sx[fc[1]],s2=Sx[fc[2]],vis=((s1[0]-s0[0])*(s2[1]-s0[1])-(s1[1]-s0[1])*(s2[0]-s0[0]))<0;
   if(k!=7&&!vis)continue;const I=fc.map(i=>.5*shade(n)+.5*shade(VN[i])),uvq=[[0,0],[1,0],[1,1],[0,1]];
   for(let j=1;j<fc.length-1;j++){const tri=[0,j,j+1];gtri(tri.map(q=>Sx[fc[q]]),tri.map(q=>I[q]),sk==0?tri.map(q=>uvq[q]):null,k==7&&vis,true)}}}
 else if(k==5){const P3=TOR.P.map(R),NN=TOR.N.map(R),Sx=P3.map(p=>[p[0]/(p[2]+4.6)*185*zs+cx,p[1]/(p[2]+4.6)*185*zs+cy]),I=NN.map(shade);
  const fs=TOR.f.map(f=>[f,(P3[f[0]][2]+P3[f[1]][2]+P3[f[2]][2]+P3[f[3]][2])/4]).sort((a,b)=>b[1]-a[1]);
  for(const[fc]of fs){const s=fc.map(i=>Sx[i]);if((s[1][0]-s[0][0])*(s[2][1]-s[0][1])-(s[1][1]-s[0][1])*(s[2][0]-s[0][0])>=0)continue;gtri([s[0],s[1],s[2]],[I[fc[0]],I[fc[1]],I[fc[2]]],null,0,1);gtri([s[0],s[2],s[3]],[I[fc[0]],I[fc[2]],I[fc[3]]],null,0,1)}}
 else if(k==3){const ms=(B/4)%3,k0=ms|0,a=.5-.5*C(PI*Math.min(1,(ms%1)*2)),A=[SPH,CUB,TRS][k0],Bs=[SPH,CUB,TRS][(k0+1)%3],sc_=1+.18*P;
  const pts=A.map((p,i)=>R([(p[0]*(1-a)+Bs[i][0]*a)*sc_,(p[1]*(1-a)+Bs[i][1]*a)*sc_,(p[2]*(1-a)+Bs[i][2]*a)*sc_])).sort((p,q)=>q[2]-p[2]);
  for(const q of pts){const Z=q[2]+3.4,x=q[0]/Z*230*zs+cx|0,y=q[1]/Z*230*zs+cy|0;if(x>=0&&x<W-1&&y>=0&&y<H-1){const c=Math.max(8,Math.min(12,(8+(4-Z)/1.6*5)|0));FG[y*W+x]=FG[y*W+x+1]=FG[y*W+x+W]=c;FG[y*W+x+W+1]=Math.max(8,c-1)}}}
 else if(k==4){const nb=30+(20*e|0),ord=[...Array(nb).keys()].sort((a,b)=>S(B*.8+a*.6)-S(B*.8+b*.6));
  for(const b of ord){const x=cx+130*S(B*.7+b*.41)*zs,y=cy+75*S(B*.95+b*.27)*zs,r=(7+3*S(B+b*.6))*(1+.35*P);[1,.75,.5,.25].forEach((s,q)=>disc(x-(1-s)*2,y-(1-s)*2,r*s,9+q))}}
 else if(k==6){const w=48*zs;for(let y=0;y<H;y++){const a=B*.9+S(y/70+B*.3)*(1.6+2.5*sn)+P*.6,xc=cx+25*S(y/45+B*.4),xs=[0,1,2,3,4].map(q=>xc+w*S(a+q*PI/2));
  for(let q=0;q<4;q++){const x0=xs[q],x1=xs[q+1];if(x1<=x0)continue;const I=Math.min(1,(x1-x0)/(1.414*w)),tex=((((y+(B*16|0))/12)|0)+q)&1,lv=Math.max(0,Math.min(1,.2+.8*I-.18*tex));
   for(let x=Math.max(0,Math.ceil(x0));x<Math.min(W,x1);x++)FG[y*W+x]=8+Math.max(0,Math.min(4,(lv*4.2+bay(x,y)-.5)|0))}}}}
function disc(x,y,r,col){for(let j=Math.max(0,Math.ceil(y-r));j<=Math.min(H-1,y+r);j++){const w=Math.sqrt(Math.max(0,r*r-(j-y)*(j-y)));const l=Math.max(0,Math.round(x-w)),rr=Math.min(W-1,Math.round(x+w));if(rr>=l)FG.fill(col,j*W+l,j*W+rr+1)}}
function line(x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/(n||1)|0,y=y0+(y1-y0)*i/(n||1)|0;if(x>=0&&x<W&&y>=0&&y<H)FG[y*W+x]=c}}
function sym(k,x,y,s){const ring=()=>{for(let a=0;a<360;a+=2)line(x+s*C(a*.01745),y+s*S(a*.01745),x+s*C((a+2)*.01745),y+s*S((a+2)*.01745),14)},poly=p=>{for(let i=0;i<p.length-1;i++)line(p[i][0],p[i][1],p[i+1][0],p[i+1][1],14)};
 if(k==0){ring();poly([0,1,2,3,4,5].map(i=>[x+s*S(i*4*PI/5),y-s*C(i*4*PI/5)]))}else if(k==1){poly([[x,y-s],[x-s*.9,y+s*.6],[x+s*.9,y+s*.6],[x,y-s]]);disc(x,y+2,3,14)}
 else if(k==2){ring();poly([0,150,240,120,210,0].map(a=>[x+s*S(a*.01745),y-s*C(a*.01745)]))}else{ring();line(x-s*.4,y,x+s*.4,y,14);line(x,y-s*.4,x,y+s*.4,14)}}
function frame(t){T=t;const[sc,bi,frac,bib,bar,P]=scene(t),B=bi+frac,e=ga(ENV,t),sn=ga(SNR,t);
 bg(sc.bg,t,B,sc,P);FG.fill(0);const r=rnd(sc.seed);
 if(sc.sym)sym(sc.seed%4,W*(.25+.5*r()),H*(.3+.4*r()),40+30*r());
 if(sc.fg!=8)fg(sc.fg,t,B,sc,P);
 if(sc.logo){const L=LOGO,ly=(14+8*S(B*.5)-10*P)|0,lx=((W-L.w)/2+12*S(B*.25))|0;for(let y=0;y<L.h;y++){const Y=ly+y;if(Y<0||Y>=H)continue;const xs=lx+(sc.drop?Math.round((3+8*sn)*S(y/5+B*2)):0);
  for(let x=0;x<L.w;x++){const X=xs+x,v=L.o[y*L.w+x];if(v&&X>=0&&X<W)FG[Y*W+X]=v}}
  for(let y=0;y<H;y++){const band=(((y-ly)%38+38)%38)/34;setp(y,13,hsv(sc.hue+.5+y/120+bar*.07,.55,Math.max(5,15-band*9)));setp(y,14,hsv(sc.hue+.6,.7,2.5))}}
 else for(let y=0;y<H;y++){const o=y*48,c=hsv(sc.hue+.1,.5,2.5);setp(y,14,[Math.min(15,PAL[o]+c[0]),Math.min(15,PAL[o+1]+c[1]),Math.min(15,PAL[o+2]+c[2])])}
 const sp=t*FPS*4|0;
 if(sc.scr<3){const amp=[50,25,70][sc.scr],base=(sc.scr!=1?H/2-16:110)-14*P;for(let c=0;c<W;c++){const off=(base+amp*S((c+sp)/57+B*.8)*(.55+.45*e))|0,sx=(c+sp)%BIG.w;for(let y=0;y<32;y++){const Y=off+y;if(Y>=0&&Y<H&&BIG.m[y*BIG.w+sx])FG[Y*W+c]=15}}}
 else[[70,0],[170,2.1]].forEach(([by,ph],lane)=>{for(let c=0;c<W;c++){const q=c+sp+lane*777,ch=(q/32)|0,off=(by+40*S(ch*.9+B*1.4+ph)*(.5+.5*e)-18*P*C(ch*1.3))|0,sx=q%BIG.w;for(let y=0;y<32;y++){const Y=off+y;if(Y>=0&&Y<H&&BIG.m[y*BIG.w+sx])FG[Y*W+c]=15}}});
 const sps=t*FPS*3|0,Y0=SY+200-18;for(let c=0;c<W;c++){const sx=(c+sps)%SMALL.w;for(let y=0;y<16;y++)if(SMALL.m[y*SMALL.w+sx])FG[(Y0+y)*W+c]=15}
 const fgc=[3.5,6,8.5,11.5,15].map((v,i)=>hsv(sc.hue+.33+i*.03,.75-.1*i,v));
 for(let y=0;y<H;y++){setp(y,15,(y>=Y0&&y<Y0+16)?hsv(.55,.3,15):hsv(.12+y/180+bar*.11,.5,15));for(let i=0;i<5;i++)setp(y,8+i,fgc[i])}
 for(let y=0,o=0;y<H;y++){const inY=y>=SY&&y<SY+200,bc=sc.ov?null:hsv(sc.hue+y/H*.3+bar*.05,.6,1.5+2*Math.max(0,S(y/7-B*PI*.5)));
  for(let x=0;x<W;x++,o++){let c0,c1,c2;if(bc&&!(inY&&x>=SX&&x<SX+320)){[c0,c1,c2]=bc}else{const p=(y*16+(FG[o]||IDX[o]))*3;c0=PAL[p];c1=PAL[p+1];c2=PAL[p+2]}
   px[o*4]=Math.max(0,Math.min(15,Math.round(c0)))*17;px[o*4+1]=Math.max(0,Math.min(15,Math.round(c1)))*17;px[o*4+2]=Math.max(0,Math.min(15,Math.round(c2)))*17;px[o*4+3]=255}}
 cx.putImageData(img,0,0)}
const au=document.getElementById('a');
document.getElementById('go').onclick=async()=>{await document.fonts.load('8px P');document.getElementById('go').remove();RUN=Math.random()*1e6|0;
 BIG=strip(cut(shuffle(MSGS).join('    ***    ')),4);SMALL=strip(cut(shuffle(MSGS).join('    ***    ')),2);LOGO=mklogo();
 const id=strip('ID',4);for(let y=0;y<64;y++)for(let x=0;x<64;x++)TEX[y*64+x]=((x>>3)+(y>>3))%2==0?1:0;for(let y=0;y<32;y++)for(let x=0;x<64;x++)if(id.m[y*id.w+x])TEX[(y+16)*64+x]=2;
 au.play();const loop=()=>{if(!window.HOLD)frame(au.currentTime);if(!au.ended)requestAnimationFrame(loop)};loop()};
