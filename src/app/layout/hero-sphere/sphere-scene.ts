import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  IcosahedronGeometry,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
  WireframeGeometry,
} from 'three';

/**
 * Sphère en points + fil de fer très léger, gris clair.
 * Rotation lente, déformation ondulante (bruit dans le vertex shader),
 * inclinaison et onde qui suivent la souris.
 * Chargée à la demande (import dynamique) pour ne pas alourdir le bundle initial.
 */

const NOISE = /* glsl */ `
  // Bruit simplex 3D — Ashima Arts / Stefan Gustavson (licence MIT)
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

const DISPLACE = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMouse;   // direction de la souris (espace objet)
  uniform float uHover;  // 0 → 1 quand la souris bouge
  vec3 displace(vec3 p){
    vec3 n = normalize(p);
    float wave = snoise(n * 1.6 + vec3(0.0, uTime * 0.18, uTime * 0.12)) * 0.12;
    float ripple = sin(dot(n, vec3(0.0, 1.0, 0.0)) * 8.0 - uTime * 1.2) * 0.025;
    float near = smoothstep(0.55, 1.0, dot(n, normalize(uMouse)));
    float push = near * uHover * (0.14 + 0.05 * sin(uTime * 3.0));
    return p + n * (wave + ripple + push);
  }
`;

export interface SphereOptions {
  lite: boolean;
  animate: boolean;
}

export class SphereScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(35, 1, 0.1, 100);
  private readonly group = new Group();
  private readonly pointsMat: ShaderMaterial;
  private readonly lineMat: ShaderMaterial;
  private readonly disposables: { dispose(): void }[] = [];

  private raf = 0;
  private running = false;
  private last = 0;
  private time = 0;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private hover = { v: 0, t: 0 };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly opts: SphereOptions,
  ) {
    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !opts.lite,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.lite ? 1.25 : 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.camera.position.set(0, 0, 6.2);

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: [0, 0, 1] },
      uHover: { value: 0 },
      uSize: { value: opts.lite ? 2.2 : 2.6 },
      uPixelRatio: { value: this.renderer.getPixelRatio() },
    };

    // --- Points
    const detail = opts.lite ? 24 : 40;
    const ico = new IcosahedronGeometry(1.5, detail);
    const pointsGeo = this.uniquePoints(ico);
    this.pointsMat = new ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      vertexShader: /* glsl */ `
        ${NOISE}
        ${DISPLACE}
        uniform float uSize;
        uniform float uPixelRatio;
        varying float vFacing;
        void main(){
          vec3 p = displace(position);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vFacing = clamp(dot(normalize(normalMatrix * normalize(position)), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
          gl_PointSize = uSize * uPixelRatio * (6.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vFacing;
        void main(){
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.1, d) * mix(0.12, 0.75, vFacing);
          gl_FragColor = vec4(vec3(0.86), a);
        }
      `,
    });
    const points = new Points(pointsGeo, this.pointsMat);

    // --- Fil de fer (plus grossier, très discret)
    const wireGeo = new WireframeGeometry(new IcosahedronGeometry(1.5, opts.lite ? 6 : 10));
    this.lineMat = new ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        ${NOISE}
        ${DISPLACE}
        varying float vFacing;
        void main(){
          vec3 p = displace(position);
          vFacing = clamp(dot(normalize(normalMatrix * normalize(position)), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vFacing;
        void main(){ gl_FragColor = vec4(vec3(0.8), mix(0.015, 0.09, vFacing)); }
      `,
    });
    const lines = new LineSegments(wireGeo, this.lineMat);

    this.group.add(lines, points);
    this.group.rotation.set(0.35, 0, 0.12);
    this.scene.add(this.group);
    this.disposables.push(ico, pointsGeo, wireGeo, this.pointsMat, this.lineMat, this.renderer);

    this.resize();
  }

  /** Les sommets de l'icosaèdre sont dupliqués par face : on les dédoublonne. */
  private uniquePoints(geo: IcosahedronGeometry): BufferGeometry {
    const src = geo.getAttribute('position');
    const seen = new Set<string>();
    const out: number[] = [];
    for (let i = 0; i < src.count; i++) {
      const x = src.getX(i), y = src.getY(i), z = src.getZ(i);
      const k = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(x, y, z);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(new Float32Array(out), 3));
    return g;
  }

  resize(): void {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    // Desktop : sphère décalée à droite, derrière le portrait
    const wide = w / h > 1.1;
    this.group.position.set(wide ? 1.55 * Math.min(w / h, 1.9) * 0.62 : 0, wide ? 0 : 0.2, 0);
    const s = wide ? 1 : Math.min(1, (w / h) * 1.35);
    this.group.scale.setScalar(s);
    if (!this.running) this.render();
  }

  /** Position du pointeur normalisée (-1 → 1). */
  pointer(nx: number, ny: number): void {
    this.mouse.tx = nx;
    this.mouse.ty = ny;
    this.hover.t = 1;
  }

  pointerLeave(): void {
    this.hover.t = 0;
  }

  start(): void {
    if (this.running || !this.opts.animate) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.tick(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private tick(dt: number): void {
    this.time += dt;
    const m = this.mouse;
    m.x += (m.tx - m.x) * Math.min(1, dt * 3);
    m.y += (m.ty - m.y) * Math.min(1, dt * 3);
    this.hover.v += (this.hover.t - this.hover.v) * Math.min(1, dt * 2);
    this.hover.t *= 0.985; // l'onde retombe quand la souris s'arrête

    this.group.rotation.y += dt * 0.08;
    this.group.rotation.x = 0.35 + m.y * 0.25;
    this.group.rotation.z = 0.12 + m.x * 0.12;

    // Direction de la souris dans l'espace de l'objet (approximation suffisante)
    const ry = -this.group.rotation.y;
    const dx = m.x, dy = -m.y, dz = 0.9;
    const u = this.pointsMat.uniforms;
    u['uTime'].value = this.time;
    u['uHover'].value = this.hover.v;
    u['uMouse'].value = [dx * Math.cos(ry) + dz * Math.sin(ry), dy, -dx * Math.sin(ry) + dz * Math.cos(ry)];
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.stop();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.forceContextLoss();
  }
}
