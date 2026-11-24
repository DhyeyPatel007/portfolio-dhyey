// Procedural canvas textures for the workshop — no image assets needed.
// Every texture is drawn at runtime so the room stays self-contained.
import * as THREE from 'three';

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d')! };
}

function toTexture(c: HTMLCanvasElement, repeat = 1): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function speckle(ctx: CanvasRenderingContext2D, w: number, h: number, n: number, alpha: number) {
  for (let i = 0; i < n; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? `rgba(255,255,255,${alpha * Math.random()})` : `rgba(0,0,0,${alpha * Math.random()})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

/** Matte concrete with panel seams and stains. */
export function concreteTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = '#23272b';
  ctx.fillRect(0, 0, 512, 512);
  // large soft stains
  for (let i = 0; i < 24; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 40 + Math.random() * 120;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() > 0.5;
    g.addColorStop(0, dark ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.05)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  speckle(ctx, 512, 512, 9000, 0.12);
  // panel seams
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  for (const x of [128, 256, 384]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();
  return toTexture(c, 2);
}

/** Dark slate floor tiles. */
export function slateTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = '#14171a';
  ctx.fillRect(0, 0, 512, 512);
  const tile = 128;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const v = 18 + Math.random() * 14;
      ctx.fillStyle = `rgb(${v},${v + 2},${v + 4})`;
      ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
    }
  }
  speckle(ctx, 512, 512, 5000, 0.08);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(512, i * tile); ctx.stroke();
  }
  return toTexture(c, 2);
}

/** Pale plywood with grain. */
export function plywoodTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 256);
  ctx.fillStyle = '#d8c9a8';
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 60; i++) {
    const y = Math.random() * 256;
    ctx.strokeStyle = `rgba(120,95,55,${0.05 + Math.random() * 0.12})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + (Math.random() * 8 - 4), 340, y + (Math.random() * 8 - 4), 512, y);
    ctx.stroke();
  }
  speckle(ctx, 512, 256, 1200, 0.05);
  return toTexture(c, 1);
}

/** Blueprint sheet: white paper, blue line drawings + dimension lines. No text. */
export function blueprintTexture(seed = 1): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 384);
  ctx.fillStyle = '#f4f2ea';
  ctx.fillRect(0, 0, 512, 384);
  ctx.strokeStyle = '#2b4c7e';
  ctx.fillStyle = '#2b4c7e';
  ctx.lineWidth = 2;
  // border
  ctx.strokeRect(14, 14, 484, 356);
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, 464, 336);
  // pseudo-random line drawing, seeded-ish by the seed value
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < 5; i++) {
    const x = 60 + rnd() * 300;
    const y = 60 + rnd() * 200;
    const w = 50 + rnd() * 90;
    const h = 40 + rnd() * 70;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 14 + rnd() * 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();
  }
  // dimension lines with arrow ticks
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = 300 + i * 14;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(440, y);
    ctx.stroke();
    for (const x of [60, 440]) {
      ctx.beginPath();
      ctx.moveTo(x - 5, y - 5);
      ctx.lineTo(x + 5, y + 5);
      ctx.stroke();
    }
  }
  return toTexture(c, 1);
}

/** A4 sheet with hand-drawn ink controls (slider, drum pads, dial). */
export function paperDeskTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 384);
  ctx.fillStyle = '#fbfaf6';
  ctx.fillRect(0, 0, 512, 384);
  ctx.strokeStyle = '#141414';
  ctx.lineCap = 'round';
  // hand-drawn wobble helper
  const wobbly = (pts: [number, number][]) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      ctx.lineTo(x + (Math.random() * 4 - 2), y + (Math.random() * 4 - 2));
    }
    ctx.stroke();
  };
  // volume slider
  ctx.lineWidth = 5;
  wobbly([[60, 90], [300, 90]]);
  ctx.lineWidth = 3;
  ctx.strokeRect(168, 66, 26, 48);
  // drum pads
  ctx.lineWidth = 4;
  for (const [x, y] of [[70, 170], [190, 170], [310, 170]] as [number, number][]) {
    ctx.beginPath();
    ctx.arc(x + 40, y + 35, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 40, y + 35, 10, 0, Math.PI * 2);
    ctx.stroke();
  }
  // dial
  ctx.beginPath();
  ctx.arc(420, 250, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(420, 250);
  ctx.lineTo(452, 218);
  ctx.stroke();
  // MUTE box
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 290, 130, 56);
  return toTexture(c, 1);
}

/** ArUco-style calibration card: 4 markers + neutral patches. */
export function arucoCardTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 384);
  ctx.fillStyle = '#f7f5ef';
  ctx.fillRect(0, 0, 512, 384);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 512, 44);
  const marker = (x: number, y: number, s: number, pat: number[]) => {
    ctx.fillStyle = '#111';
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = '#f7f5ef';
    ctx.fillRect(x + 8, y + 8, s - 16, s - 16);
    ctx.fillStyle = '#111';
    const cell = (s - 16) / 4;
    pat.forEach((v, i) => {
      if (v) ctx.fillRect(x + 8 + (i % 4) * cell, y + 8 + Math.floor(i / 4) * cell, cell, cell);
    });
  };
  marker(40, 80, 110, [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0]);
  marker(362, 80, 110, [0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1]);
  marker(40, 230, 110, [1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1]);
  marker(362, 230, 110, [0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0]);
  // neutral patches
  const greys = ['#d8d8d8', '#b0b0b0', '#888', '#5a5a5a', '#e8e8e8', '#333'];
  greys.forEach((g, i) => {
    ctx.fillStyle = g;
    ctx.fillRect(190 + i * 26, 130, 22, 22);
  });
  // 100 mm check line
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(190, 320);
  ctx.lineTo(322, 320);
  ctx.stroke();
  return toTexture(c, 1);
}

/** Dark CAD monitor screen. */
export function monitorTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(640, 384);
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, 640, 384);
  ctx.strokeStyle = '#58a6ff';
  ctx.lineWidth = 2;
  // wireframe-ish block
  ctx.strokeRect(180, 90, 280, 170);
  ctx.beginPath();
  ctx.moveTo(180, 90); ctx.lineTo(250, 40); ctx.lineTo(530, 40); ctx.lineTo(460, 90); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(460, 90); ctx.lineTo(530, 40); ctx.lineTo(530, 210); ctx.lineTo(460, 260); ctx.stroke();
  ctx.beginPath();
  ctx.arc(320, 175, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(180, 175); ctx.lineTo(460, 175); ctx.stroke();
  // dimension lines
  ctx.strokeStyle = '#10e59a';
  ctx.lineWidth = 1;
  for (const y of [300, 320, 340]) {
    ctx.beginPath();
    ctx.moveTo(120, y);
    ctx.lineTo(520, y);
    ctx.stroke();
  }
  // top bar
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, 640, 28);
  ctx.fillStyle = '#58a6ff';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(24 + i * 22, 14, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(c, 1);
}

/** GPU top: matte black, two fan circles, mint accent line. */
export function gpuTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 256);
  ctx.fillStyle = '#101214';
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = '#2a2e33';
  ctx.lineWidth = 3;
  for (const x of [140, 372]) {
    ctx.beginPath();
    ctx.arc(x, 128, 92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, 128, 60, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, 128);
      ctx.lineTo(x + Math.cos(a) * 88, 128 + Math.sin(a) * 88);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#10e59a';
  ctx.fillRect(0, 8, 512, 6);
  return toTexture(c, 1);
}

/** Glowing neon "D" on transparency — the core. */
export function neonDTexture(): THREE.CanvasTexture {
  const { c, ctx } = canvas(512, 512);
  ctx.clearRect(0, 0, 512, 512);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const draw = (width: number, color: string, blur: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowColor = '#2563eb';
    ctx.shadowBlur = blur;
    ctx.beginPath();
    ctx.moveTo(150, 420);
    ctx.lineTo(150, 92);
    ctx.lineTo(300, 92);
    ctx.bezierCurveTo(420, 92, 420, 420, 300, 420);
    ctx.lineTo(150, 420);
    ctx.stroke();
    // inner counter
    ctx.beginPath();
    ctx.moveTo(222, 348);
    ctx.lineTo(222, 164);
    ctx.lineTo(292, 164);
    ctx.bezierCurveTo(352, 164, 352, 348, 292, 348);
    ctx.lineTo(222, 348);
    ctx.stroke();
  };
  draw(34, 'rgba(37,99,235,0.55)', 46);
  draw(20, '#2563eb', 30);
  draw(9, '#bcd6ff', 18);
  draw(4, '#ffffff', 8);
  return toTexture(c, 1);
}

/** Soft radial glow sprite (additive). */
export function glowTexture(color = '#2563eb'): THREE.CanvasTexture {
  const { c, ctx } = canvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color + 'aa');
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(c, 1);
}
