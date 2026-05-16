// ============================================================
//  TRACKMANIA NATIONS — TRUE 3D WebGL ENGINE
//  Shared engine module loaded by all track HTML files
// ============================================================

'use strict';

// ─── MAT4 ────────────────────────────────────────────────────
const M4 = {
  id:()=>new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
  mul(a,b){
    const o=new Float32Array(16);
    for(let r=0;r<4;r++) for(let c=0;c<4;c++){
      let s=0; for(let k=0;k<4;k++) s+=a[r*4+k]*b[k*4+c];
      o[r*4+c]=s;
    }
    return o;
  },
  perspective(fov,asp,near,far){
    const f=1/Math.tan(fov/2), nf=1/(near-far);
    return new Float32Array([
      f/asp,0,0,0,
      0,f,0,0,
      0,0,(far+near)*nf,-1,
      0,0,2*far*near*nf,0
    ]);
  },
  lookAt(eye,ctr,up){
    let [ex,ey,ez]=eye,[cx,cy,cz]=ctr,[ux,uy,uz]=up;
    let fx=ex-cx,fy=ey-cy,fz=ez-cz;
    let il=1/Math.sqrt(fx*fx+fy*fy+fz*fz);
    fx*=il;fy*=il;fz*=il;
    let rx=uy*fz-uz*fy,ry=uz*fx-ux*fz,rz=ux*fy-uy*fx;
    il=1/Math.sqrt(rx*rx+ry*ry+rz*rz);
    rx*=il;ry*=il;rz*=il;
    let ox=fy*rz-fz*ry,oy=fz*rx-fx*rz,oz=fx*ry-fy*rx;
    return new Float32Array([
      rx,ox,fx,0, ry,oy,fy,0, rz,oz,fz,0,
      -(rx*ex+ry*ey+rz*ez),-(ox*ex+oy*ey+oz*ez),-(fx*ex+fy*ey+fz*ez),1
    ]);
  },
  rotY(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);},
  rotX(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);},
  rotZ(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);},
  trans(x,y,z){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]);},
  scale(x,y,z){return new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]);},
  inv(m){
    // 4x4 inverse
    const a=m; const b=new Float32Array(16);
    const a00=a[0],a01=a[1],a02=a[2],a03=a[3];
    const a10=a[4],a11=a[5],a12=a[6],a13=a[7];
    const a20=a[8],a21=a[9],a22=a[10],a23=a[11];
    const a30=a[12],a31=a[13],a32=a[14],a33=a[15];
    const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10;
    const b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12;
    const b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30;
    const b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
    let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;
    if(!det) return M4.id();
    det=1/det;
    b[0]=(a11*b11-a12*b10+a13*b09)*det;b[1]=(a02*b10-a01*b11-a03*b09)*det;
    b[2]=(a31*b05-a32*b04+a33*b03)*det;b[3]=(a22*b04-a21*b05-a23*b03)*det;
    b[4]=(a12*b08-a10*b11-a13*b07)*det;b[5]=(a00*b11-a02*b08+a03*b07)*det;
    b[6]=(a32*b02-a30*b05-a33*b01)*det;b[7]=(a20*b05-a22*b02+a23*b01)*det;
    b[8]=(a10*b10-a11*b08+a13*b06)*det;b[9]=(a02*b06-a01*b10+a03*b08)*det; // fixed
    b[9]=(a01*b08-a00*b10-a03*b06)*det;
    b[10]=(a30*b04-a31*b02+a33*b00)*det;b[11]=(a21*b02-a20*b04-a23*b00)*det;
    b[12]=(a11*b06-a10*b09-a12*b06)*det;
    b[12]=(a11*b07-a10*b09-a12*b06)*det; // fix
    b[12]=(a10*b09-a11*b07+a12*b06)*det; // signed
    b[13]=(a01*b07-a00*b09+a02*b06)*det;
    b[14]=(a31*b01-a30*b03-a32*b00)*det;
    b[15]=(a20*b03-a21*b01+a22*b00)*det;
    return b;
  },
  normalMat(m){
    // transpose of inverse upper-left 3x3
    const a=m;
    let a00=a[0],a01=a[1],a02=a[2];
    let a10=a[4],a11=a[5],a12=a[6];
    let a20=a[8],a21=a[9],a22=a[10];
    let b01=a22*a11-a12*a21,b11=-a22*a10+a12*a20,b21=a21*a10-a11*a20;
    let det=a00*b01+a01*b11+a02*b21;
    if(!det) return new Float32Array([1,0,0,0,1,0,0,0,1]);
    det=1/det;
    return new Float32Array([
      b01*det,(a02*a21-a22*a01)*det,(a12*a01-a02*a11)*det,
      b11*det,(a22*a00-a02*a20)*det,(a02*a10-a12*a00)*det,
      b21*det,(a01*a20-a21*a00)*det,(a11*a00-a01*a10)*det
    ]);
  }
};

// ─── SHADER SOURCES ─────────────────────────────────────────
const VERT_MAIN = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aNorm;
in vec2 aUV;
in vec4 aColor;

uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform mat3 uNormMat;

out vec3 vWorldPos;
out vec3 vNorm;
out vec2 vUV;
out vec4 vColor;

void main(){
  vec4 world = uModel * vec4(aPos,1.0);
  vWorldPos = world.xyz;
  vNorm = normalize(uNormMat * aNorm);
  vUV = aUV;
  vColor = aColor;
  gl_Position = uProj * uView * world;
}`;

const FRAG_MAIN = `#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vNorm;
in vec2 vUV;
in vec4 vColor;

uniform vec3 uCamPos;
uniform float uTime;
uniform int uMatType; // 0=road,1=boost,2=grass,3=barrier,4=car,5=sky,6=finish,7=emissive

out vec4 fragColor;

// Lights: stadium floods
const vec3 LIGHT0 = normalize(vec3(0.3, 1.0, 0.5));
const vec3 LIGHT1 = normalize(vec3(-0.5, 0.8, -0.3));
const vec3 AMBIENT = vec3(0.06, 0.10, 0.18);
const vec3 L0COL   = vec3(0.85, 0.92, 1.0);
const vec3 L1COL   = vec3(0.3, 0.55, 0.9);

vec3 phong(vec3 albedo, vec3 N, vec3 V){
  vec3 d0 = max(dot(N,LIGHT0),0.0)*L0COL;
  vec3 d1 = max(dot(N,LIGHT1),0.0)*L1COL;
  vec3 r0 = reflect(-LIGHT0,N);
  float sp = pow(max(dot(r0,V),0.0),32.0)*0.4;
  return albedo*(AMBIENT+d0+d1) + sp;
}

// checker
float checker(vec2 uv, float sz){
  vec2 p = floor(uv/sz);
  return mod(p.x+p.y,2.0);
}

// road stripe
float stripe(float u, float period, float width){
  return step(width, mod(u,period));
}

void main(){
  vec3 N = normalize(vNorm);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 col;

  if(uMatType==0){ // ROAD — asphalt
    float g = checker(vUV*0.5, 1.0)*0.03;
    vec3 asph = vec3(0.10+g, 0.11+g, 0.13+g);
    // white center line dashes
    float dash = step(0.48, abs(vUV.x-0.5))*0.0;
    // edge lines
    float edge = step(0.93, vUV.x)+step(0.93,1.0-vUV.x);
    asph = mix(asph, vec3(0.9,0.9,0.9), edge*0.7);
    col = phong(asph*vColor.rgb, N, V);

  } else if(uMatType==1){ // BOOST pad
    float pulse = 0.5+0.5*sin(uTime*6.0 + vUV.y*4.0);
    vec3 boostCol = mix(vec3(0.0,0.6,0.15), vec3(0.0,1.0,0.4), pulse);
    // arrow pattern
    float arrowT = mod(vUV.y*3.0 - uTime*2.0, 1.0);
    float arrowU = abs(vUV.x-0.5)*2.0;
    float arrow  = step(arrowU, 1.0-arrowT)*step(arrowT,0.85);
    boostCol = mix(boostCol, vec3(0.5,1.0,0.7), arrow*0.6);
    col = phong(boostCol, N, V) + boostCol*0.3*pulse;

  } else if(uMatType==2){ // GRASS
    float noise = fract(sin(dot(vUV*20.0,vec2(12.9898,78.233)))*43758.5);
    vec3 g1 = vec3(0.04,0.14,0.04), g2=vec3(0.06,0.20,0.06);
    col = phong(mix(g1,g2,noise), N, V);

  } else if(uMatType==3){ // BARRIER
    float stripe_v = checker(vUV*vec2(4.0,1.0),0.5);
    vec3 bc = mix(vec3(0.0,0.25,0.65), vec3(0.9,0.9,0.95), stripe_v*0.1);
    // reflective top strip
    float top = step(0.85, vUV.y);
    bc = mix(bc, vec3(0.8,0.9,1.0), top*0.8);
    col = phong(bc, N, V);
    // fresnel
    float fr = pow(1.0-max(dot(N,V),0.0),4.0)*0.4;
    col += fr*vec3(0.0,0.5,1.0);

  } else if(uMatType==4){ // CAR body
    col = phong(vColor.rgb, N, V);
    // metallic sheen
    float fr = pow(1.0-max(dot(N,V),0.0),3.0)*0.6;
    col += fr*vec3(1.0,0.9,0.8)*0.5;

  } else if(uMatType==5){ // SKY dome
    col = vColor.rgb;

  } else if(uMatType==6){ // FINISH checker
    float ch = checker(vUV*vec2(8.0,4.0), 0.5);
    col = phong(mix(vec3(1.0),vec3(0.05),ch), N, V);
    col += vec3(1.0,0.2,0.0)*0.3*ch;

  } else if(uMatType==7){ // EMISSIVE (boost glow, signs)
    col = vColor.rgb * (1.5+0.5*sin(uTime*4.0));
  }

  // fog
  float dist = length(vWorldPos - uCamPos);
  float fog = 1.0 - exp(-dist*0.0012);
  vec3 fogCol = vec3(0.01, 0.03, 0.07);
  col = mix(col, fogCol, fog*0.85);

  fragColor = vec4(col, 1.0);
}`;

// Shadow / depth pass (simple)
const VERT_SHADOW = `#version 300 es
precision highp float;
in vec3 aPos;
uniform mat4 uMVP;
void main(){ gl_Position = uMVP * vec4(aPos,1.0); }`;
const FRAG_SHADOW = `#version 300 es
precision highp float;
out vec4 f;
void main(){ f = vec4(gl_FragCoord.z,0,0,1); }`;

// Post-process (bloom+tonemap+vignette)
const VERT_POST = `#version 300 es
in vec2 aPos;
out vec2 vUV;
void main(){ vUV=aPos*0.5+0.5; gl_Position=vec4(aPos,0,1); }`;
const FRAG_POST = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uSpeed;   // 0-1
uniform float uBoost;
uniform float uTime;
out vec4 f;

vec3 aces(vec3 x){
  return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);
}

void main(){
  vec3 col = texture(uScene,vUV).rgb;
  vec3 bloom = texture(uBloom,vUV).rgb;
  col += bloom*1.8;

  // Motion blur radial
  if(uSpeed>0.4){
    vec2 dir = (vUV-0.5)*0.018*(uSpeed-0.4)*2.5;
    vec3 mb = vec3(0);
    for(int i=1;i<=6;i++) mb += texture(uScene, vUV - dir*float(i)).rgb;
    col = mix(col, col+mb/6.0, 0.35*(uSpeed-0.4)*2.5);
  }

  // Boost chromatic aberration
  if(uBoost>0.0){
    float ab = uBoost*0.006;
    col.r = texture(uScene, vUV+vec2(ab,0)).r;
    col.b = texture(uScene, vUV-vec2(ab,0)).b;
  }

  // Vignette
  vec2 uv2 = vUV*2.0-1.0;
  float vig = 1.0 - dot(uv2,uv2)*0.45;
  col *= vig;

  // Tonemap + gamma
  col = aces(col*1.1);
  col = pow(col, vec3(1.0/2.2));

  // Scanline noise (subtle film grain)
  float grain = fract(sin(dot(vUV*1000.0+uTime,vec2(127.1,311.7)))*43758.5)*0.04-0.02;
  col += grain;

  f = vec4(col,1.0);
}`;

// Bloom blur
const FRAG_BLUR = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
uniform vec2 uDir;
out vec4 f;
float gauss[9] = float[](0.0625,0.125,0.0625,0.125,0.25,0.125,0.0625,0.125,0.0625);
void main(){
  vec3 col=vec3(0);
  for(int i=-4;i<=4;i++) col+=texture(uTex,vUV+uDir*float(i)).rgb*0.111;
  // brightness threshold for bloom
  vec3 bright = max(col-0.7,0.0);
  f=vec4(bright,1.0);
}`;

// ─── GL HELPERS ────────────────────────────────────────────
function compileShader(gl, src, type){
  const s = gl.createShader(type);
  gl.shaderSource(s,src); gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s)+'\n'+src.split('\n').map((l,i)=>`${i+1}: ${l}`).join('\n'));
  return s;
}
function makeProgram(gl, vs, fs){
  const p=gl.createProgram();
  gl.attachShader(p,compileShader(gl,vs,gl.VERTEX_SHADER));
  gl.attachShader(p,compileShader(gl,fs,gl.FRAGMENT_SHADER));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

function makeFBO(gl,w,h,linear=false){
  const tex=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,w,h,0,gl.RGBA,gl.HALF_FLOAT,null);
  const f=linear?gl.LINEAR:gl.NEAREST;
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,f);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,f);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const rb=gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER,rb);
  gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,w,h);
  const fb=gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  return {fb,tex,w,h};
}

// ─── MESH BUILDER ───────────────────────────────────────────
class Mesh {
  constructor(gl){
    this.gl=gl;
    this.verts=[]; this.normals=[]; this.uvs=[]; this.colors=[]; this.indices=[];
    this.vao=null; this.count=0;
  }
  addQuad(v0,v1,v2,v3,col=[1,1,1,1],uv0=[0,0],uv1=[1,0],uv2=[1,1],uv3=[0,1]){
    const base=this.verts.length/3;
    // normal from cross product
    const ax=v1[0]-v0[0],ay=v1[1]-v0[1],az=v1[2]-v0[2];
    const bx=v3[0]-v0[0],by=v3[1]-v0[1],bz=v3[2]-v0[2];
    const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
    const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
    const n=[nx/nl,ny/nl,nz/nl];
    for(const [v,uv] of [[v0,uv0],[v1,uv1],[v2,uv2],[v3,uv3]]){
      this.verts.push(...v); this.normals.push(...n);
      this.uvs.push(...uv); this.colors.push(...col);
    }
    this.indices.push(base,base+1,base+2, base,base+2,base+3);
  }
  addTri(v0,v1,v2,col=[1,1,1,1]){
    const base=this.verts.length/3;
    const ax=v1[0]-v0[0],ay=v1[1]-v0[1],az=v1[2]-v0[2];
    const bx=v2[0]-v0[0],by=v2[1]-v0[1],bz=v2[2]-v0[2];
    const nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
    const nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
    const n=[nx/nl,ny/nl,nz/nl];
    for(const v of [v0,v1,v2]){
      this.verts.push(...v); this.normals.push(...n);
      this.uvs.push(0,0); this.colors.push(...col);
    }
    this.indices.push(base,base+1,base+2);
  }
  upload(){
    const gl=this.gl;
    this.vao=gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const mkBuf=(data,loc,size)=>{
      const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);
    };
    mkBuf(this.verts,0,3); mkBuf(this.normals,1,3); mkBuf(this.uvs,2,2); mkBuf(this.colors,3,4);
    const ib=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(this.indices),gl.STATIC_DRAW);
    this.count=this.indices.length;
    gl.bindVertexArray(null);
  }
  draw(gl){
    if(!this.vao) return;
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES,this.count,gl.UNSIGNED_INT,0);
    gl.bindVertexArray(null);
  }
}

// Dynamic mesh (updated per frame, for car body etc.)
class DynMesh extends Mesh {
  upload(){
    const gl=this.gl;
    if(!this.vao) this.vao=gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const mkBuf=(data,loc,size,buf)=>{
      if(!buf) buf=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);
      return buf;
    };
    this._b0=mkBuf(this.verts,0,3,this._b0);
    this._b1=mkBuf(this.normals,1,3,this._b1);
    this._b2=mkBuf(this.uvs,2,2,this._b2);
    this._b3=mkBuf(this.colors,3,4,this._b3);
    if(!this._ib) this._ib=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this._ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(this.indices),gl.DYNAMIC_DRAW);
    this.count=this.indices.length;
    gl.bindVertexArray(null);
  }
  clear(){this.verts=[];this.normals=[];this.uvs=[];this.colors=[];this.indices=[];}
}

// ─── TRACK GEOMETRY BUILDER ─────────────────────────────────
// Track defined as array of nodes with position+tangent computed via spline
// Each node: { pos:[x,y,z], up:[x,y,z], width, banking, type }

function buildTrackGeometry(gl, nodes){
  const roadMesh   = new Mesh(gl);
  const grassMesh  = new Mesh(gl);
  const barrierMesh= new Mesh(gl);
  const boostMesh  = new Mesh(gl);
  const finishMesh = new Mesh(gl);
  const cpMesh     = new Mesh(gl);
  const extraMesh  = new Mesh(gl); // ramps, loops etc.

  const N = nodes.length;
  for(let i=0;i<N-1;i++){
    const a=nodes[i], b=nodes[i+1];
    // tangent
    const tx=b.pos[0]-a.pos[0], ty=b.pos[1]-a.pos[1], tz=b.pos[2]-a.pos[2];
    const tl=Math.sqrt(tx*tx+ty*ty+tz*tz)||1;
    // right vector = tangent cross up, then re-orthogonalize
    const up=[0,1,0];
    let rx=ty*up[2]-tz*up[1], ry=tz*up[0]-tx*up[2], rz=tx*up[1]-ty*up[0];
    let rl=Math.sqrt(rx*rx+ry*ry+rz*rz)||1;
    rx/=rl;ry/=rl;rz/=rl;
    // apply banking
    const bank_a=(a.banking||0)*Math.PI/180;
    const bank_b=(b.banking||0)*Math.PI/180;

    const hw_a=(a.width||8)/2, hw_b=(b.width||8)/2;

    // 4 corners of road quad
    function corner(node, hw, bankAng, side){
      // side: -1=left, +1=right
      const [px,py,pz]=node.pos;
      // bank rotates the right vector around tangent
      const c=Math.cos(bankAng*side), s_=Math.sin(bankAng);
      return [px+rx*hw*side, py+s_*hw*side, pz+rz*hw*side];
    }
    const aL=[a.pos[0]-rx*hw_a, a.pos[1]+Math.sin(bank_a)*hw_a, a.pos[2]-rz*hw_a];
    const aR=[a.pos[0]+rx*hw_a, a.pos[1]-Math.sin(bank_a)*hw_a, a.pos[2]+rz*hw_a];
    const bL=[b.pos[0]-rx*hw_b, b.pos[1]+Math.sin(bank_b)*hw_b, b.pos[2]-rz*hw_b];
    const bR=[b.pos[0]+rx*hw_b, b.pos[1]-Math.sin(bank_b)*hw_b, b.pos[2]+rz*hw_b];

    const t=i/N;
    const roadCol=[1,1,1,1];

    // --- ROAD SURFACE ---
    const targetMesh = (a.type==='boost')?boostMesh : (a.type==='finish')?finishMesh : roadMesh;
    targetMesh.addQuad(aL,aR,bR,bL, roadCol, [0,t*20],[1,t*20],[1,(t+1/N)*20],[0,(t+1/N)*20]);

    // --- GRASS (2x road width each side) ---
    const grassW=14;
    const aLG=[a.pos[0]-rx*(hw_a+grassW), a.pos[1], a.pos[2]-rz*(hw_a+grassW)];
    const bLG=[b.pos[0]-rx*(hw_b+grassW), b.pos[1], b.pos[2]-rz*(hw_b+grassW)];
    const aRG=[a.pos[0]+rx*(hw_a+grassW), a.pos[1], a.pos[2]+rz*(hw_a+grassW)];
    const bRG=[b.pos[0]+rx*(hw_b+grassW), b.pos[1], b.pos[2]+rz*(hw_b+grassW)];
    grassMesh.addQuad(aLG,aL,bL,bLG,[1,1,1,1]);
    grassMesh.addQuad(aR,aRG,bRG,bR,[1,1,1,1]);

    // --- BARRIERS ---
    const bH=1.2;
    const mkBarrier=(p0,p1,p2,p3)=>{
      const top0=[p0[0],p0[1]+bH,p0[2]];
      const top1=[p1[0],p1[1]+bH,p1[2]];
      const top2=[p2[0],p2[1]+bH,p2[2]];
      const top3=[p3[0],p3[1]+bH,p3[2]];
      barrierMesh.addQuad(p0,p1,top1,top0,[1,1,1,1],[0,0],[1,0],[1,1],[0,1]);
      barrierMesh.addQuad(p2,p3,top3,top2,[1,1,1,1],[0,0],[1,0],[1,1],[0,1]);
      barrierMesh.addQuad(top0,top1,top2,top3,[1,1,1,1]);
    };
    mkBarrier(aLG,aL,bL,bLG);
    mkBarrier(aR,aRG,bRG,bR);

    // --- CHECKPOINT ARCH ---
    if(a.checkpoint){
      const archH=5.5, archW=hw_a+0.5;
      const p0=[a.pos[0]-rx*archW, a.pos[1], a.pos[2]-rz*archW];
      const p1=[a.pos[0]+rx*archW, a.pos[1], a.pos[2]+rz*archW];
      const t0=[p0[0], p0[1]+archH, p0[2]];
      const t1=[p1[0], p1[1]+archH, p1[2]];
      const midTop=[a.pos[0], a.pos[1]+archH+1, a.pos[2]];
      const thick=0.35;
      const tx2=tx/tl*thick, tz2=tz/tl*thick;
      // left post
      cpMesh.addQuad(p0,[p0[0]+tx2,p0[1],p0[2]+tz2],[t0[0]+tx2,t0[1],t0[2]+tz2],t0,[0,0,1,1]);
      // right post
      cpMesh.addQuad(p1,[p1[0]+tx2,p1[1],p1[2]+tz2],[t1[0]+tx2,t1[1],t1[2]+tz2],t1,[0,0,1,1]);
      // top beam
      cpMesh.addQuad(t0,[t0[0]+tx2,t0[1],t0[2]+tz2],[t1[0]+tx2,t1[1],t1[2]+tz2],t1,[0,0,1,1]);
    }
  }

  roadMesh.upload(); grassMesh.upload(); barrierMesh.upload();
  boostMesh.upload(); finishMesh.upload(); cpMesh.upload(); extraMesh.upload();

  return {roadMesh,grassMesh,barrierMesh,boostMesh,finishMesh,cpMesh,extraMesh};
}

// ─── SPLINE INTERPOLATION ───────────────────────────────────
function catmullRom(p0,p1,p2,p3,t){
  return 0.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);
}

function buildSplineNodes(controlPoints, stepsPerSegment=12){
  const nodes=[];
  const C=controlPoints;
  for(let i=0;i<C.length-1;i++){
    const p0=C[Math.max(0,i-1)], p1=C[i], p2=C[i+1], p3=C[Math.min(C.length-1,i+2)];
    for(let s=0;s<stepsPerSegment;s++){
      const t=s/stepsPerSegment;
      const x=catmullRom(p0.x,p1.x,p2.x,p3.x,t);
      const y=catmullRom(p0.y,p1.y,p2.y,p3.y,t);
      const z=catmullRom(p0.z,p1.z,p2.z,p3.z,t);
      const w=p1.w+(p2.w-p1.w)*t;
      const bank=p1.bank+(p2.bank-p1.bank)*t;
      const type=p1.type||'road';
      const checkpoint=p1.checkpoint&&s===0;
      const finish=p1.finish&&s===0;
      nodes.push({pos:[x,y,z],width:w,banking:bank,type,checkpoint,finish});
    }
  }
  // close: add last point
  const last=C[C.length-1];
  nodes.push({pos:[last.x,last.y,last.z],width:last.w,banking:0,type:'road'});
  return nodes;
}

// ─── SKY DOME ───────────────────────────────────────────────
function buildSkyDome(gl){
  const mesh=new Mesh(gl);
  const R=800, stacks=8, slices=16;
  for(let i=0;i<stacks;i++){
    const phi0= (i/stacks)*Math.PI, phi1=((i+1)/stacks)*Math.PI;
    for(let j=0;j<slices;j++){
      const th0=(j/slices)*Math.PI*2, th1=((j+1)/slices)*Math.PI*2;
      const v=i/stacks;
      // gradient: dark top → horizon blue
      const t_=Math.pow(v,0.7);
      const col=[lerp(0.01,0.05,t_), lerp(0.03,0.12,t_), lerp(0.08,0.25,t_), 1];
      const p=(phi,th)=>[Math.sin(phi)*Math.cos(th)*R, Math.cos(phi)*R, Math.sin(phi)*Math.sin(th)*R];
      mesh.addQuad(p(phi0,th0),p(phi0,th1),p(phi1,th1),p(phi1,th0),col);
    }
  }
  mesh.upload();
  return mesh;
}
function lerp(a,b,t){return a+(b-a)*t;}

// ─── STADIUM GEOMETRY ────────────────────────────────────────
function buildStadium(gl){
  const mesh=new Mesh(gl);
  // 4 tribune stands around the track
  const stands=[
    {x:60,z:0,rot:0},{x:-60,z:0,rot:Math.PI},
    {x:0,z:60,rot:Math.PI/2},{x:0,z:-60,rot:-Math.PI/2}
  ];
  for(const s of stands){
    const c=Math.cos(s.rot), sn=Math.sin(s.rot);
    const W=50, H=20, D=15;
    // tiers
    for(let t=0;t<5;t++){
      const y0=t*4, y1=y0+3.5;
      const d0=t*3, d1=d0+2.5;
      const col=[0.04+t*0.008, 0.08+t*0.01, 0.16+t*0.02, 1];
      // seats row
      const p=(x,y,z)=>[s.x+c*z+sn*x, y, s.z-sn*z+c*x];
      mesh.addQuad(p(-W/2,y1,d0),p(W/2,y1,d0),p(W/2,y0,d1),p(-W/2,y0,d1),col);
    }
    // back wall
    const p=(x,y,z)=>[s.x+c*z+sn*x, y, s.z-sn*z+c*x];
    mesh.addQuad(p(-W/2,0,15),p(W/2,0,15),p(W/2,22,15),p(-W/2,22,15),[0.02,0.05,0.10,1]);
    // floodlight pole
    const lx=s.x+c*18*sn, lz=s.z+sn*18*c;
    for(let h=0;h<5;h++){
      mesh.addQuad([lx-0.3,h*4,lz-0.3],[lx+0.3,h*4,lz-0.3],[lx+0.3,(h+1)*4,lz-0.3],[lx-0.3,(h+1)*4,lz-0.3],[0.1,0.15,0.2,1]);
    }
  }
  mesh.upload();
  return mesh;
}

// ─── CAR GEOMETRY BUILDER ───────────────────────────────────
function buildCarMesh(gl, bodyColor=[0.85,0.1,0.1]){
  const m=new DynMesh(gl);

  function box(cx,cy,cz,sx,sy,sz,col){
    const hx=sx/2,hy=sy/2,hz=sz/2;
    const v=(dx,dy,dz)=>[cx+dx*hx, cy+dy*hy, cz+dz*hz];
    // 6 faces
    m.addQuad(v(-1,-1,-1),v(1,-1,-1),v(1,1,-1),v(-1,1,-1),col); // front
    m.addQuad(v(-1,-1,1),v(-1,1,1),v(1,1,1),v(1,-1,1),col);     // back
    m.addQuad(v(-1,-1,-1),v(-1,1,-1),v(-1,1,1),v(-1,-1,1),col); // left
    m.addQuad(v(1,-1,-1),v(1,-1,1),v(1,1,1),v(1,1,-1),col);     // right
    m.addQuad(v(-1,1,-1),v(1,1,-1),v(1,1,1),v(-1,1,1),col);     // top
    m.addQuad(v(-1,-1,-1),v(-1,-1,1),v(1,-1,1),v(1,-1,-1),col); // bottom
  }

  const bc=bodyColor, dark=[0.05,0.05,0.06,1];
  const white=[0.95,0.95,0.95,1], carbon=[0.08,0.08,0.10,1];
  const tc=[...bc,1];

  // Main monocoque
  box(0, 0.18, 0,  1.5, 0.28, 3.6, tc);
  // Nose cone (wedge shape via quads)
  m.addQuad([0.55,0.18,-1.8],[-0.55,0.18,-1.8],[-0.2,0.32,-3.5],[0.2,0.32,-3.5],tc);
  m.addQuad([0.55,0.04,-1.8],[0.55,0.18,-1.8],[0.2,0.18,-3.5],[0.2,0.04,-3.5],tc);
  m.addQuad([-0.55,0.18,-1.8],[-0.55,0.04,-1.8],[-0.2,0.04,-3.5],[-0.2,0.18,-3.5],tc);
  m.addQuad([-0.55,0.04,-1.8],[0.55,0.04,-1.8],[0.2,0.04,-3.5],[-0.2,0.04,-3.5],[0.06,0.06,0.07,1]);
  // Sidepods
  box(-1.05, 0.10, 0.3,  0.55, 0.28, 2.2, tc);
  box( 1.05, 0.10, 0.3,  0.55, 0.28, 2.2, tc);
  // sidepod intake
  box(-1.1, 0.16, -0.4, 0.12, 0.18, 0.5, dark);
  box( 1.1, 0.16, -0.4, 0.12, 0.18, 0.5, dark);

  // Engine cover / airbox
  box(0, 0.48, 0.3,  0.3, 0.24, 1.8, carbon);
  box(0, 0.68, 0.1,  0.2, 0.2, 0.4, dark); // airbox

  // Front wing
  box(0, -0.01, -3.8,  2.4, 0.07, 0.5, tc);
  box(0, 0.00, -3.6,   1.8, 0.05, 0.3, [0.9,0.9,0.9,1]); // flap
  // front wing endplates
  box(-1.2, 0.10, -3.7, 0.06, 0.25, 0.7, tc);
  box( 1.2, 0.10, -3.7, 0.06, 0.25, 0.7, tc);

  // Rear wing
  box(0, 0.78, 2.0,  2.0, 0.1, 0.55, tc);
  box(0, 0.70, 2.15, 2.2, 0.1, 0.4, white); // DRS element
  box(-1.0, 0.70, 2.0, 0.08, 0.42, 0.72, tc); // endplate L
  box( 1.0, 0.70, 2.0, 0.08, 0.42, 0.72, tc); // endplate R

  // Cockpit surround
  box(0, 0.38, -0.3, 0.5, 0.18, 0.8, carbon);
  // Halo
  box(0, 0.62, -0.4, 0.08, 0.12, 1.2, carbon);
  box(-0.28, 0.70, 0.0, 0.08, 0.08, 0.6, carbon);
  box( 0.28, 0.70, 0.0, 0.08, 0.08, 0.6, carbon);
  // Visor
  m.addQuad([-0.22,0.50,-0.7],[0.22,0.50,-0.7],[0.18,0.44,-0.1],[-0.18,0.44,-0.1],[0.0,0.4,0.8,0.9]);

  // Floors / diffuser
  box(0, -0.06, 0.8, 1.4, 0.05, 1.8, carbon);
  box(0, -0.04, 1.8, 1.2, 0.15, 0.6, carbon);

  // Wheels (4)
  function wheel(wx,wz){
    const wc=[0.08,0.08,0.09,1], rimc=[0.5,0.5,0.55,1];
    const cx2=wx, cz2=wz, cy2=0.0, R=0.42, W=0.36;
    // tyre box approx
    box(cx2,cy2,cz2, W,R*2,R*2, wc);
    // rim disc (front face)
    box(cx2,cy2,cz2-R*0.6, W*0.7,R*1.6,0.08, rimc);
  }
  wheel(-1.3,-2.8); wheel(1.3,-2.8); // front
  wheel(-1.35, 1.5); wheel(1.35, 1.5); // rear

  m.upload();
  return m;
}

// ─── ENGINE CLASS ─────────────────────────────────────────────
class TM_Engine {
  constructor(canvas, trackNodes, trackName){
    this.canvas=canvas;
    this.trackName=trackName;
    const gl=canvas.getContext('webgl2',{antialias:false, alpha:false});
    if(!gl) throw new Error('WebGL2 required');
    gl.getExtension('EXT_color_buffer_float');
    this.gl=gl;

    // Programs
    this.prog=makeProgram(gl,VERT_MAIN,FRAG_MAIN);
    this.progPost=makeProgram(gl,VERT_POST,FRAG_POST);
    this.progBlur=makeProgram(gl,VERT_POST,FRAG_BLUR);

    // Quad for post
    this.quadVAO=this._makeQuad();

    // FBOs
    this._initFBOs();

    // Track
    this.trackNodes=trackNodes;
    this.geom=buildTrackGeometry(gl,trackNodes);
    this.skyDome=buildSkyDome(gl);
    this.stadium=buildStadium(gl);
    this.carMesh=buildCarMesh(gl);

    // Physics
    this.player=new PlayerPhysics(trackNodes);
    this.keys={};
    this.serialSpeed=0; this.serialSteer=0;

    // Camera
    this.camAngle=0; this.camPitch=0.18; this.camDist=9; this.camHeight=2.2;
    this.camShake=0;

    // Race
    this.raceActive=false; this.raceStart=0; this.bestMs=null;
    this.elapsedMs=0; this.cpCrossed=0;
    this.totalCPs=trackNodes.filter(n=>n.checkpoint).length;

    // Time
    this.time=0; this.lastT=0;

    // Init done
    this._setupInput();
  }

  _initFBOs(){
    const gl=this.gl, w=this.canvas.width, h=this.canvas.height;
    this.fboScene=makeFBO(gl,w,h,true);
    this.fboBlur0=makeFBO(gl,w>>1,h>>1,true);
    this.fboBlur1=makeFBO(gl,w>>1,h>>1,true);
  }

  resize(){
    const gl=this.gl;
    this.canvas.width=this.canvas.clientWidth;
    this.canvas.height=this.canvas.clientHeight;
    this._initFBOs();
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
  }

  _makeQuad(){
    const gl=this.gl;
    const vao=gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.bindVertexArray(null);
    return vao;
  }

  _setupInput(){
    window.addEventListener('keydown',e=>{this.keys[e.code]=true;e.preventDefault();});
    window.addEventListener('keyup',e=>{this.keys[e.code]=false;});
  }

  startRace(){
    this.player.reset(this.trackNodes);
    this.raceActive=true;
    this.raceStart=performance.now();
    this.cpCrossed=0;
    this.elapsedMs=0;
    requestAnimationFrame(t=>this._loop(t));
  }

  _loop(t){
    if(!this.raceActive) return;
    const dt=Math.min(0.05,(t-this.lastT)/1000);
    this.lastT=t; this.time=t*0.001;
    this.elapsedMs=t-this.raceStart;

    const inp={
      accel: (this.keys['KeyW']||this.keys['ArrowUp']) ? 1 : Math.max(0,(this.serialSpeed-30)/100),
      brake: (this.keys['KeyS']||this.keys['ArrowDown']) ? 1 : 0,
      steerL:(this.keys['KeyA']||this.keys['ArrowLeft']) ? 1 : Math.max(0,-this.serialSteer/100),
      steerR:(this.keys['KeyD']||this.keys['ArrowRight']) ? 1 : Math.max(0,this.serialSteer/100),
      handbrake:this.keys['Space'] ? 1:0,
    };

    const events=this.player.update(dt, inp, this.trackNodes);
    if(events.checkpoint) this.cpCrossed++;
    if(events.finish && this.cpCrossed>=this.totalCPs){
      this._onFinish();
    }
    if(this.keys['KeyR']) this.player.respawn(this.trackNodes);

    // Camera shake from speed + collisions
    this.camShake=lerp(this.camShake, events.wallHit?0.35:0, 0.2);

    this._render(dt);
    this._updateHUD();
    requestAnimationFrame(t2=>this._loop(t2));
  }

  _render(dt){
    const gl=this.gl;
    const W=this.canvas.width, H=this.canvas.height;

    // ── 1. Scene pass ──
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboScene.fb);
    gl.viewport(0,0,W,H);
    gl.clearColor(0.01,0.03,0.06,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);

    // Camera matrices
    const p=this.player;
    const carPos=p.worldPos;
    const carAngle=p.worldAngle;

    // Camera target: behind+above car
    const camDist=this.camDist+(p.speed/120);
    const shake=(Math.random()-0.5)*this.camShake;
    const camX=carPos[0]-Math.sin(carAngle)*camDist;
    const camY=carPos[1]+this.camHeight + p.speed*0.008;
    const camZ=carPos[2]-Math.cos(carAngle)*camDist;
    const tgtX=carPos[0]+Math.sin(carAngle)*3;
    const tgtY=carPos[1]+0.6+shake;
    const tgtZ=carPos[2]+Math.cos(carAngle)*3;

    const proj=M4.perspective(0.9, W/H, 0.3, 2000);
    const view=M4.lookAt([camX,camY,camZ],[tgtX,tgtY,tgtZ],[0,1,0]);
    const camPos3=[camX,camY,camZ];

    gl.useProgram(this.prog);
    const ul=(n)=>gl.getUniformLocation(this.prog,n);
    gl.uniformMatrix4fv(ul('uProj'),false,proj);
    gl.uniformMatrix4fv(ul('uView'),false,view);
    gl.uniform3fv(ul('uCamPos'),camPos3);
    gl.uniform1f(ul('uTime'),this.time);

    const drawMesh=(mesh, model, matType)=>{
      if(!mesh.count) return;
      gl.uniformMatrix4fv(ul('uModel'),false,model);
      gl.uniformMatrix3fv(ul('uNormMat'),false,M4.normalMat(model));
      gl.uniform1i(ul('uMatType'),matType);
      mesh.draw(gl);
    };

    const id=M4.id();

    // Sky (no depth write)
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    const skyM=M4.trans(camX,camY,camZ);
    drawMesh(this.skyDome,skyM,5);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);

    // Stadium
    drawMesh(this.stadium,id,3);

    // Track surfaces
    drawMesh(this.geom.grassMesh,id,2);
    drawMesh(this.geom.roadMesh,id,0);
    drawMesh(this.geom.boostMesh,id,1);
    drawMesh(this.geom.finishMesh,id,6);
    drawMesh(this.geom.barrierMesh,id,3);
    drawMesh(this.geom.cpMesh,id,7);

    // Car
    const carM = M4.mul(
      M4.mul(M4.trans(...carPos), M4.rotY(-carAngle)),
      M4.mul(M4.rotZ(-p.steer*0.12), M4.rotX(p.pitchVis))
    );
    drawMesh(this.carMesh, carM, 4);

    // ── 2. Bloom extract + blur ──
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.useProgram(this.progBlur);
    const ulb=(n)=>gl.getUniformLocation(this.progBlur,n);

    gl.bindFramebuffer(gl.FRAMEBUFFER,this.fboBlur0.fb);
    gl.viewport(0,0,this.fboBlur0.w,this.fboBlur0.h);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.fboScene.tex);
    gl.uniform1i(ulb('uTex'),0);
    gl.uniform2f(ulb('uDir'),1/this.fboBlur0.w,0);
    gl.bindVertexArray(this.quadVAO); gl.drawArrays(gl.TRIANGLES,0,6);

    gl.bindFramebuffer(gl.FRAMEBUFFER,this.fboBlur1.fb);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.fboBlur0.tex);
    gl.uniform2f(ulb('uDir'),0,1/this.fboBlur1.h);
    gl.drawArrays(gl.TRIANGLES,0,6);

    // ── 3. Composite ──
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(0,0,W,H);
    gl.useProgram(this.progPost);
    const ulp=(n)=>gl.getUniformLocation(this.progPost,n);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,this.fboScene.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D,this.fboBlur1.tex);
    gl.uniform1i(ulp('uScene'),0);
    gl.uniform1i(ulp('uBloom'),1);
    gl.uniform1f(ulp('uSpeed'),p.speed/320);
    gl.uniform1f(ulp('uBoost'),p.onBoost?1:0);
    gl.uniform1f(ulp('uTime'),this.time);
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLES,0,6);
  }

  _onFinish(){
    const ms=this.elapsedMs;
    if(!this.bestMs||ms<this.bestMs) this.bestMs=ms;
    this.raceActive=false;
    const medals=this.trackMedals||{gold:27000,silver:35000,bronze:50000};
    let medal='NO MEDAL',mCol='#e74c3c';
    if(ms<=medals.gold){medal='GOLD';mCol='#f4d03f';}
    else if(ms<=medals.silver){medal='SILVER';mCol='#bdc3c7';}
    else if(ms<=medals.bronze){medal='BRONZE';mCol='#e67e22';}
    if(this.onFinish) this.onFinish(ms, medal, mCol);
  }

  _updateHUD(){
    const p=this.player;
    const spd=Math.round(p.speed);
    const gear=this._gear(p.speed);
    const t=this.elapsedMs;
    if(document.getElementById('h-speed')) document.getElementById('h-speed').textContent=spd;
    if(document.getElementById('h-gear'))  document.getElementById('h-gear').textContent=gear;
    if(document.getElementById('h-time'))  document.getElementById('h-time').textContent=fmtTime(t);
    if(document.getElementById('h-cp'))    document.getElementById('h-cp').textContent=this.cpCrossed;
    if(document.getElementById('h-boost')) document.getElementById('h-boost').style.opacity=p.onBoost?'1':'0';
    if(document.getElementById('rpm-fill')) document.getElementById('rpm-fill').style.width=(p.speed/360*100)+'%';
  }

  _gear(s){if(s<1)return'N';const t=[0,55,100,155,210,265,325];for(let i=0;i<t.length-1;i++){if(s<t[i+1])return i+1;}return 6;}
}

// ─── PLAYER PHYSICS ──────────────────────────────────────────
class PlayerPhysics {
  constructor(nodes){
    this.speed=0; this.steer=0; this.pitchVis=0;
    this.worldPos=[0,0.5,0]; this.worldAngle=0;
    this.trackIdx=0; this.lateralOffset=0;
    this.onBoost=false; this.airborne=false; this.airVel=0;
    this.reset(nodes);
  }
  reset(nodes){
    const n=nodes[0];
    this.worldPos=[...n.pos]; this.worldPos[1]+=0.4;
    this.speed=0; this.steer=0; this.trackIdx=0; this.lateralOffset=0;
    this.airborne=false; this.airVel=0; this.pitchVis=0;
    // compute initial angle from first segment
    if(nodes.length>1){
      const d=[nodes[1].pos[0]-nodes[0].pos[0], nodes[1].pos[2]-nodes[0].pos[2]];
      this.worldAngle=Math.atan2(d[0],d[2]);
    }
  }
  respawn(nodes){this.reset(nodes);}

  update(dt, inp, nodes){
    const events={checkpoint:false,finish:false,wallHit:false};
    const N=nodes.length;

    // Find nearest node ahead
    let bestDist=Infinity, bestIdx=this.trackIdx;
    for(let di=-5;di<30;di++){
      const idx=(this.trackIdx+di+N)%N;
      const n=nodes[idx];
      const dx=n.pos[0]-this.worldPos[0];
      const dz=n.pos[2]-this.worldPos[2];
      const d=dx*dx+dz*dz;
      if(d<bestDist){bestDist=d;bestIdx=idx;}
    }
    const curNode=nodes[bestIdx];
    const nextNode=nodes[(bestIdx+1)%N];

    // Tangent
    const tx=nextNode.pos[0]-curNode.pos[0];
    const tz=nextNode.pos[2]-curNode.pos[2];
    const tl=Math.sqrt(tx*tx+tz*tz)||1;
    const targetAngle=Math.atan2(tx,tz);

    // Boost
    this.onBoost=(curNode.type==='boost' && this.speed>15);
    const maxSpd=this.onBoost?340:260;
    const accelRate=this.onBoost?140:90;

    // Accel/brake
    if(inp.accel>0){
      this.speed+=accelRate*dt*inp.accel;
    } else if(inp.brake>0){
      this.speed-=160*dt;
    } else if(this.speed<30){
      this.speed+=20*dt; // auto-roll
    }
    this.speed-=28*dt*(1+inp.handbrake*2); // friction
    this.speed=Math.max(0,Math.min(maxSpd,this.speed));

    // Steering
    const steerTarget=(inp.steerR-inp.steerL);
    this.steer+=(steerTarget-this.steer)*Math.min(1,dt*5);
    this.steer*=0.88;

    // Advance track position
    const advanceDist=this.speed*dt;
    // Update lateral offset
    const steerPower=this.steer*(this.speed/260)*3.5*(inp.handbrake?2:1);
    this.lateralOffset+=steerPower*dt;
    this.lateralOffset*=0.93;
    const hw=(curNode.width||8)/2;
    const wallDist=hw-1.5;
    if(Math.abs(this.lateralOffset)>wallDist){
      this.lateralOffset=Math.sign(this.lateralOffset)*wallDist;
      this.speed*=0.55;
      events.wallHit=true;
    }

    // Move world position along spline
    const moveAngle=targetAngle;
    this.worldAngle=lerp(this.worldAngle,moveAngle,Math.min(1,dt*4));
    this.worldPos[0]+=Math.sin(moveAngle)*advanceDist;
    this.worldPos[2]+=Math.cos(moveAngle)*advanceDist;

    // Lateral
    const rx=Math.cos(moveAngle), rz=-Math.sin(moveAngle);
    this.worldPos[0]+=rx*steerPower*dt*1.5;
    this.worldPos[2]+=rz*steerPower*dt*1.5;

    // Height tracking
    const targetY=curNode.pos[1]+0.35;
    this.worldPos[1]=lerp(this.worldPos[1],targetY,Math.min(1,dt*6));

    // Pitch visual
    const pitchTgt=(curNode.pos[1]-(nodes[(bestIdx-2+N)%N]?.pos[1]||curNode.pos[1]))*0.08;
    this.pitchVis=lerp(this.pitchVis,pitchTgt,dt*3);

    // Advance track index
    const distToNext=Math.sqrt((nextNode.pos[0]-this.worldPos[0])**2+(nextNode.pos[2]-this.worldPos[2])**2);
    if(distToNext<advanceDist+2 && this.speed>5){
      this.trackIdx=(bestIdx+1)%N;
    }

    // Events
    if(curNode.checkpoint) events.checkpoint=true;
    if(curNode.finish) events.finish=true;

    return events;
  }
}

// ─── TIME FORMAT ─────────────────────────────────────────────
function fmtTime(ms){
  const s=ms/1000;
  const m=Math.floor(s/60);
  const sec=(s%60).toFixed(3).padStart(6,'0');
  return `${m}:${sec}`;
}

// Export
window.TM = {TM_Engine, buildSplineNodes, fmtTime, lerp};
