// Three.js engine for The Concrete Drafting Lab.
// Procedural room by default; if a real Gaussian splat exists at
// /world/workshop.spz it is loaded instead (see splat.ts).
import * as THREE from 'three';
import { STATIONS, CENTRE_VIEW, PALETTE, type StationId } from './stations';
import {
  concreteTexture,
  slateTexture,
  plywoodTexture,
  blueprintTexture,
  paperDeskTexture,
  arucoCardTexture,
  monitorTexture,
  gpuTexture,
  neonDTexture,
  glowTexture,
} from './textures';
import { tryLoadSplat } from './splat';

export type RoomMode = 'procedural' | 'splat';

export interface EngineCallbacks {
  onStation: (id: StationId) => void;
  onMenu: () => void;
  onBoot: () => void;
  onReady: (mode: RoomMode) => void;
  onHover: (id: StationId | null) => void;
}

interface Tween {
  start: number;
  dur: number;
  update: (t: number) => void;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class WorkshopEngine {
  private canvas: HTMLCanvasElement;
  private cb: EngineCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private startTime = performance.now();
  private lastMs = performance.now();
  private raf = 0;
  private disposed = false;

  private keys = new Set<string>();
  private yaw = 0;
  private pitch = 0;
  private booted = false;
  private tweens: Tween[] = [];
  private now = 0;

  private room = new THREE.Group();
  private lamps: { light: THREE.PointLight; bulb: THREE.MeshStandardMaterial }[] = [];
  private dCore!: THREE.Group;
  private dLight!: THREE.PointLight;
  private dGlow!: THREE.Sprite;
  private ambient!: THREE.AmbientLight;
  private hemi!: THREE.HemisphereLight;

  private clickTargets: { id: StationId | 'menu'; obj: THREE.Object3D }[] = [];
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2(-10, -10);
  private pointerDirty = false;
  private hovered: StationId | null = null;

  private glide: {
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromYaw: number;
    toYaw: number;
    fromPitch: number;
    toPitch: number;
    start: number;
    dur: number;
  } | null = null;

  private downPos: { x: number; y: number; t: number } | null = null;
  private dragging = false;
  private lastPointer = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement, cb: EngineCallbacks) {
    this.canvas = canvas;
    this.cb = cb;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.camera = new THREE.PerspectiveCamera(68, 1, 0.05, 40);
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(...CENTRE_VIEW.pos);
    this.camera.rotation.y = 0;
    this.camera.rotation.x = 0;
    this.scene.background = new THREE.Color('#0b0d0e');
    this.scene.fog = new THREE.FogExp2(0x0b0d0e, 0.04);
  }

  async init(): Promise<void> {
    this.buildRoom();
    this.scene.add(this.room);
    this.bindInput();
    this.resize();
    window.addEventListener('resize', this.resize);

    // Splat first, procedural fallback — never a broken viewer.
    const splat = await tryLoadSplat(this.scene);
    if (splat && !this.disposed) {
      this.room.visible = false;
      // The splat carries its own room (and its own D); the procedural
      // click targets are hidden with it, so clear them — the dock still
      // navigates, and the D button opens the menu.
      this.clickTargets = [];
      this.mode = 'splat';
    } else {
      this.mode = 'procedural';
    }
    this.cb.onReady(this.mode);
    this.loop();
  }

  private mode: RoomMode = 'procedural';

  // ---------------------------------------------------------------- room

  private buildRoom() {
    const concrete = concreteTexture();
    const slate = slateTexture();
    const plywood = plywoodTexture();

    this.ambient = new THREE.AmbientLight(0xffffff, 0.14);
    this.scene.add(this.ambient);
    this.hemi = new THREE.HemisphereLight(0x8a93a0, 0x141210, 0.22);
    this.scene.add(this.hemi);

    // floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ map: slate, roughness: 0.85, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.room.add(floor);

    // ceiling
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ color: '#101214', roughness: 1 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3;
    this.room.add(ceil);

    // walls
    const wallMat = new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.95 });
    const mkWall = (w: number, h: number, x: number, y: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      this.room.add(m);
      return m;
    };
    mkWall(5, 3, 0, 1.5, -2.5, 0); // back (D wall)
    mkWall(5, 3, -2.5, 1.5, 0, Math.PI / 2); // left
    mkWall(5, 3, 2.5, 1.5, 0, -Math.PI / 2); // right
    mkWall(5, 3, 0, 1.5, 2.5, Math.PI); // front (behind the entrance)

    // U-bench: back run + two side runs, pale plywood + steel legs
    const benchMat = new THREE.MeshStandardMaterial({ map: plywood, roughness: 0.7 });
    const steelMat = new THREE.MeshStandardMaterial({ color: PALETTE.steel, roughness: 0.5, metalness: 0.7 });
    const bench = (w: number, d: number, x: number, z: number) => {
      const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), benchMat);
      top.position.set(x, 0.88, z);
      this.room.add(top);
      const legGeo = new THREE.BoxGeometry(0.05, 0.88, 0.05);
      for (const [lx, lz] of [[-w / 2 + 0.08, -d / 2 + 0.08], [w / 2 - 0.08, -d / 2 + 0.08], [-w / 2 + 0.08, d / 2 - 0.08], [w / 2 - 0.08, d / 2 - 0.08]] as const) {
        const leg = new THREE.Mesh(legGeo, steelMat);
        leg.position.set(x + lx, 0.44, z + lz);
        this.room.add(leg);
      }
    };
    bench(4.4, 0.65, 0, -2.05); // back
    bench(0.65, 3.6, -2.05, 0.1); // left
    bench(0.65, 3.6, 2.05, 0.1); // right

    // wall blueprints
    const bp1 = blueprintTexture(1);
    const bp2 = blueprintTexture(2);
    const bp3 = blueprintTexture(3);
    const bpMat1 = new THREE.MeshStandardMaterial({ map: bp1, roughness: 0.85 });
    const bpMat2 = new THREE.MeshStandardMaterial({ map: bp2, roughness: 0.85 });
    const bpMat3 = new THREE.MeshStandardMaterial({ map: bp3, roughness: 0.85 });
    const pin = (mat: THREE.Material, w: number, x: number, y: number, z: number, ry: number, rz = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.75), mat);
      m.position.set(x, y, z);
      m.rotation.y = ry;
      m.rotation.z = rz;
      this.room.add(m);
    };
    pin(bpMat1, 0.62, -2.48, 1.75, -0.4, Math.PI / 2, 0.02);
    pin(bpMat2, 0.55, -2.48, 1.7, 0.9, Math.PI / 2, -0.02);
    pin(bpMat3, 0.62, 2.48, 1.75, 0.3, -Math.PI / 2, 0.02);

    // storage bins flanking the D on the back wall
    const binMat = new THREE.MeshStandardMaterial({ color: '#0e1013', roughness: 0.6 });
    const labelMat = new THREE.MeshStandardMaterial({ color: PALETTE.mint, roughness: 0.5 });
    for (const side of [-1, 1]) {
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 3; i++) {
          const bin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 0.15), binMat);
          bin.position.set(side * (1.35 + i * 0.34), 1.95 - row * 0.24, -2.42);
          this.room.add(bin);
          const label = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.01), labelMat);
          label.position.set(side * (1.35 + i * 0.34), 1.95 - row * 0.24, -2.34);
          this.room.add(label);
        }
      }
    }

    this.buildStations();
    this.buildLamps();
    this.buildDCore();
  }

  private buildStations() {
    const paperMat = new THREE.MeshStandardMaterial({ map: paperDeskTexture(), roughness: 0.9 });
    const cardMat = new THREE.MeshStandardMaterial({ map: arucoCardTexture(), roughness: 0.85 });
    const monitorMat = new THREE.MeshStandardMaterial({
      map: monitorTexture(),
      roughness: 0.4,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: monitorTexture(),
      emissiveIntensity: 0.25,
    });
    const gpuMat = new THREE.MeshStandardMaterial({ map: gpuTexture(), roughness: 0.45, metalness: 0.4 });
    const blackMat = new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.5 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: '#f4f2ea', roughness: 0.9 });
    const penMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.4 });
    const capMat = new THREE.MeshStandardMaterial({ color: PALETTE.cobalt, roughness: 0.35, metalness: 0.3 });

    const group = (id: StationId, x: number, z: number, face: number) => {
      const g = new THREE.Group();
      g.position.set(x, 0.92, z);
      g.rotation.y = face;
      this.room.add(g);
      this.clickTargets.push({ id, obj: g });
      return g;
    };

    // 01 DrawAnything — left bench, faces the room (+x)
    {
      const g = group('drawanything', -2.05, 0.9, Math.PI / 2);
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.297, 0.21), paperMat);
      paper.rotation.x = -Math.PI / 2;
      paper.rotation.z = 0.1;
      paper.position.y = 0.005;
      g.add(paper);
      const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.15, 10), penMat);
      pen.rotation.z = Math.PI / 2;
      pen.rotation.y = 0.5;
      pen.position.set(0.05, 0.012, 0.14);
      g.add(pen);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.013, 20), capMat);
      cap.position.set(-0.09, 0.012, -0.12);
      g.add(cap);
    }

    // 02 AuraPPH — left bench back: phone on a stand + calibration card
    {
      const g = group('aurapph', -2.05, -1.3, Math.PI / 2);
      const card = new THREE.Mesh(new THREE.PlaneGeometry(0.148, 0.105), cardMat);
      card.rotation.x = -Math.PI / 2;
      card.position.set(0.02, 0.005, 0.05);
      g.add(card);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.06), blackMat);
      stand.position.set(-0.05, 0.02, -0.08);
      stand.rotation.x = -0.35;
      g.add(stand);
      const phone = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.008, 0.15), blackMat);
      phone.position.set(-0.05, 0.06, -0.09);
      phone.rotation.x = -0.5;
      g.add(phone);
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.002, 0.14),
        new THREE.MeshBasicMaterial({ color: '#0a2a4a' })
      );
      screen.position.set(-0.05, 0.0644, -0.0924);
      screen.rotation.x = -0.5;
      g.add(screen);
    }

    // 03 SpecBalloon — back bench: angled blueprint on a stand
    {
      const g = group('specballoon', -1.3, -2.05, 0);
      const bp = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.297),
        new THREE.MeshStandardMaterial({ map: blueprintTexture(4), roughness: 0.85 })
      );
      bp.position.set(0, 0.12, 0.02);
      bp.rotation.x = -0.45;
      g.add(bp);
      const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.03, 0.2), blackMat);
      wedge.position.set(0, 0.02, -0.05);
      wedge.rotation.x = 0.3;
      g.add(wedge);
    }

    // 04 Vajra — back bench: matte black GPU block
    {
      const g = group('vajra', 1.3, -2.05, 0);
      const gpu = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.055, 0.13), gpuMat);
      gpu.position.y = 0.03;
      g.add(gpu);
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.008, 0.005),
        new THREE.MeshStandardMaterial({ color: PALETTE.mint, emissive: new THREE.Color(PALETTE.mint), emissiveIntensity: 0.7 })
      );
      strip.position.set(0, 0.03, 0.068);
      g.add(strip);
    }

    // 05 PHALANX — right bench: dossier stack + document
    {
      const g = group('phalanx', 2.05, -1.3, -Math.PI / 2);
      for (let i = 0; i < 3; i++) {
        const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.004, 0.297), whiteMat);
        sheet.position.set(0, 0.005 + i * 0.005, 0);
        sheet.rotation.y = (i - 1) * 0.08;
        g.add(sheet);
      }
      const doc = new THREE.Mesh(
        new THREE.PlaneGeometry(0.21, 0.297),
        new THREE.MeshStandardMaterial({ map: blueprintTexture(5), roughness: 0.9 })
      );
      doc.rotation.x = -Math.PI / 2;
      doc.rotation.z = 0.12;
      doc.position.set(-0.02, 0.02, 0.12);
      g.add(doc);
      const stamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.02, 0.04),
        new THREE.MeshStandardMaterial({ color: '#7a1f1f', roughness: 0.6 })
      );
      stamp.position.set(0.1, 0.012, -0.1);
      stamp.rotation.y = 0.4;
      g.add(stamp);
    }

    // CAD monitor on the back bench centre (decor)
    {
      const g = new THREE.Group();
      g.position.set(0, 0.92, -2.12);
      this.room.add(g);
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.04), blackMat);
      stand.position.y = 0.08;
      g.add(stand);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.32), monitorMat);
      screen.position.y = 0.3;
      g.add(screen);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.34, 0.015), blackMat);
      frame.position.set(0, 0.3, -0.01);
      g.add(frame);
    }
  }

  private buildLamps() {
    const shadeMat = new THREE.MeshStandardMaterial({ color: '#e8a33d', roughness: 0.4, metalness: 0.3 });
    const armMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5, metalness: 0.6 });
    for (const st of STATIONS) {
      const [lx, ly, lz] = st.lamp;
      const g = new THREE.Group();
      g.position.set(lx, ly, lz);
      this.room.add(g);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 16), armMat);
      base.position.y = 0.01;
      g.add(base);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), armMat);
      stem.position.set(0, 0.16, 0);
      stem.rotation.z = 0.25;
      g.add(stem);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.11, 20, 1, true), shadeMat);
      shade.position.set(0.07, 0.32, 0);
      shade.rotation.z = 0.5;
      g.add(shade);
      const bulbMat = new THREE.MeshStandardMaterial({
        color: '#ffca7a',
        emissive: new THREE.Color('#ffb347'),
        emissiveIntensity: 0,
      });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), bulbMat);
      bulb.position.set(0.07, 0.29, 0);
      g.add(bulb);
      const light = new THREE.PointLight(0xffb347, 0, 3.2, 1.8);
      light.position.set(0.07, 0.26, 0);
      g.add(light);
      this.lamps.push({ light, bulb: bulbMat });
    }
  }

  private buildDCore() {
    this.dCore = new THREE.Group();
    this.dCore.position.set(0, 1.78, -2.32);
    const dMat = new THREE.MeshBasicMaterial({
      map: neonDTexture(),
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
      opacity: 0,
    });
    const d = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), dMat);
    this.dCore.add(d);
    this.dCore.userData.mat = dMat;
    this.dGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture('#2563eb'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.dGlow.scale.set(2.4, 2.4, 1);
    this.dCore.add(this.dGlow);
    this.dLight = new THREE.PointLight(0x2563eb, 0, 5, 1.6);
    this.dLight.position.set(0, 0, 0.4);
    this.dCore.add(this.dLight);
    this.dCore.scale.setScalar(0.7);
    this.room.add(this.dCore);
    this.clickTargets.push({ id: 'menu', obj: this.dCore });
  }

  // ---------------------------------------------------------------- input

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
      e.preventDefault();
      this.keys.add(k);
      if (!this.booted) this.triggerBoot();
      this.glide = null;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private onPointerDown = (e: PointerEvent) => {
    this.downPos = { x: e.clientX, y: e.clientY, t: performance.now() };
    this.dragging = true;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.canvas.setPointerCapture(e.pointerId);
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointerNdc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.pointerDirty = true;
    if (!this.dragging || !this.downPos) return;
    const dx = e.clientX - this.lastPointer.x;
    const dy = e.clientY - this.lastPointer.y;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    if (Math.abs(e.clientX - this.downPos.x) + Math.abs(e.clientY - this.downPos.y) > 4) {
      this.glide = null;
    }
    this.yaw -= dx * 0.0032;
    this.pitch = clamp(this.pitch - dy * 0.0032, -0.6, 0.6);
    if (!this.booted) this.triggerBoot();
  };

  private onPointerUp = (e: PointerEvent) => {
    this.dragging = false;
    if (!this.downPos) return;
    const moved = Math.hypot(e.clientX - this.downPos.x, e.clientY - this.downPos.y);
    const dt = performance.now() - this.downPos.t;
    this.downPos = null;
    if (moved > 6 || dt > 450) return;
    this.handleClick(e);
  };

  private handleClick(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(
      this.clickTargets.map((t) => t.obj),
      true
    );
    if (!hits.length) return;
    let obj: THREE.Object3D | null = hits[0].object;
    while (obj) {
      const found = this.clickTargets.find((t) => t.obj === obj);
      if (found) {
        if (found.id === 'menu') this.cb.onMenu();
        else this.cb.onStation(found.id);
        return;
      }
      obj = obj.parent;
    }
  }

  private bindInput() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
  }

  // ---------------------------------------------------------------- boot + glide

  triggerBoot() {
    if (this.booted) return;
    this.booted = true;
    this.cb.onBoot();
    const t0 = this.now;
    // lamps wake station by station
    this.lamps.forEach((lamp, i) => {
      const start = t0 + 0.25 + i * 0.38;
      this.tweens.push({
        start,
        dur: 0.6,
        update: (t) => {
          lamp.light.intensity = 5 * t;
          lamp.bulb.emissiveIntensity = 2.4 * t;
        },
      });
    });
    // the D core spins up last
    const dStart = t0 + 0.25 + this.lamps.length * 0.38;
    this.tweens.push({
      start: dStart,
      dur: 1.1,
      update: (t) => {
        const mat = this.dCore.userData.mat as THREE.MeshBasicMaterial;
        mat.opacity = t;
        (this.dGlow.material as THREE.SpriteMaterial).opacity = 0.5 * t;
        this.dLight.intensity = 1.6 * t;
        this.dCore.scale.setScalar(0.7 + 0.3 * t);
      },
    });
    // room lifts out of the dark a little
    this.tweens.push({
      start: t0,
      dur: 2.2,
      update: (t) => {
        this.ambient.intensity = 0.14 + 0.2 * t;
        this.hemi.intensity = 0.22 + 0.18 * t;
      },
    });
  }

  goToStation(id: StationId) {
    const st = STATIONS.find((s) => s.id === id);
    if (!st) return;
    this.glideTo(st.viewPos, st.viewTarget);
  }

  goToCentre() {
    this.glideTo(CENTRE_VIEW.pos, CENTRE_VIEW.target);
  }

  private glideTo(pos: [number, number, number], target: [number, number, number]) {
    const dx = target[0] - pos[0];
    const dy = target[1] - pos[1];
    const dz = target[2] - pos[2];
    const toYaw = Math.atan2(-dx, -dz);
    const toPitch = Math.atan2(dy, Math.hypot(dx, dz));
    // shortest yaw path
    let dyaw = toYaw - this.yaw;
    while (dyaw > Math.PI) dyaw -= Math.PI * 2;
    while (dyaw < -Math.PI) dyaw += Math.PI * 2;
    this.glide = {
      fromPos: this.camera.position.clone(),
      toPos: new THREE.Vector3(...pos),
      fromYaw: this.yaw,
      toYaw: this.yaw + dyaw,
      fromPitch: this.pitch,
      toPitch,
      start: this.now,
      dur: 0.7,
    };
  }

  // ---------------------------------------------------------------- loop

  private resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    // Wall-clock time: on slow (software) renderers the frame rate can be
    // ~1 fps, so accumulating clamped per-frame dt would stall the boot
    // sequence for many wall-clock seconds.
    const nowMs = performance.now();
    const dt = Math.min((nowMs - this.lastMs) / 1000, 0.1);
    this.lastMs = nowMs;
    this.now = (nowMs - this.startTime) / 1000;

    // tweens
    this.tweens = this.tweens.filter((tw) => {
      const t = clamp((this.now - tw.start) / tw.dur, 0, 1);
      if (t <= 0) return true;
      tw.update(easeInOut(t));
      return t < 1;
    });

    // glide
    if (this.glide) {
      const g = this.glide;
      const t = clamp((this.now - g.start) / g.dur, 0, 1);
      const e = easeInOut(t);
      this.camera.position.lerpVectors(g.fromPos, g.toPos, e);
      this.yaw = g.fromYaw + (g.toYaw - g.fromYaw) * e;
      this.pitch = g.fromPitch + (g.toPitch - g.fromPitch) * e;
      if (t >= 1) this.glide = null;
    } else {
      // WASD / arrows
      const speed = 1.7 * dt;
      const fwd = (this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0) - (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0);
      const strafe = (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) - (this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0);
      if (fwd !== 0 || strafe !== 0) {
        const sin = Math.sin(this.yaw);
        const cos = Math.cos(this.yaw);
        const nx = -sin * fwd + cos * strafe;
        const nz = -cos * fwd - sin * strafe;
        const len = Math.hypot(nx, nz) || 1;
        this.camera.position.x = clamp(this.camera.position.x + (nx / len) * speed, -2.05, 2.05);
        this.camera.position.z = clamp(this.camera.position.z + (nz / len) * speed, -2.05, 2.15);
      }
    }

    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    // D core idle motion once awake
    if (this.booted) {
      this.dCore.rotation.y += dt * 0.25;
      this.dCore.position.y = 1.78 + Math.sin(this.now * 0.8) * 0.03;
    }

    // hover raycast (once per frame at most)
    if (this.pointerDirty) {
      this.pointerDirty = false;
      this.raycaster.setFromCamera(this.pointerNdc, this.camera);
      const hits = this.raycaster.intersectObjects(
        this.clickTargets.map((t) => t.obj),
        true
      );
      let id: StationId | null = null;
      if (hits.length) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !id) {
          const found = this.clickTargets.find((t) => t.obj === obj);
          if (found && found.id !== 'menu') id = found.id;
          obj = obj.parent;
        }
      }
      if (id !== this.hovered) {
        this.hovered = id;
        this.cb.onHover(id);
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.renderer.dispose();
  }
}
