// Gaussian-splat drop-in for the workshop.
// HOW IT WORKS: if a real splat exists at /world/workshop.spz, the engine loads
// it with @sparkjsdev/spark (SplatMesh) and hides the procedural room.
// If there is no .spz (the normal case today) this resolves null and the
// procedural room is used. Any failure falls back to procedural — never a
// broken viewer.
//
// TO SHIP A REAL SPLAT LATER:
// 1. Run the frames in ~/workspace/genie-world-frames/ (162 frames, 0-60 s)
//    through Luma AI free (browser upload) and export .ply.
// 2. Compress to .spz in SuperSplat.
// 3. In SuperSplat, align the splat to the same origin/scale as the procedural
//    room (floor y = 0, back wall z = -2.5, room centre 0,0) so the station
//    viewpoints and dock glides still land on the right spots.
// 4. Drop the file at public/world/workshop.spz and redeploy. No code change.
import * as THREE from 'three';

export const SPLAT_URL = '/world/workshop.spz';

export async function tryLoadSplat(scene: THREE.Scene): Promise<THREE.Object3D | null> {
  try {
    const head = await fetch(SPLAT_URL, { method: 'HEAD' });
    if (!head.ok) return null;
    // The SPA fallback serves index.html with 200 for unknown paths — a real
    // .spz never comes back as text/html, and is never tiny.
    const ct = head.headers.get('content-type') ?? '';
    if (ct.includes('text/html')) return null;
    const len = Number(head.headers.get('content-length') ?? '0');
    if (len > 0 && len < 10000) return null;
    const { SplatMesh } = await import('@sparkjsdev/spark');
    const splat = new SplatMesh({ url: SPLAT_URL });
    // SplatMesh loads asynchronously; give it a few seconds, then verify it
    // actually produced renderable data before committing to splat mode.
    scene.add(splat);
    const ok = await new Promise<boolean>((resolve) => {
      const t = window.setTimeout(() => resolve(false), 8000);
      const check = () => {
        // A loaded splat has a non-empty geometry bounding sphere.
        const mesh = splat as unknown as { geometry?: THREE.BufferGeometry };
        const g = mesh.geometry;
        if (g) {
          g.computeBoundingSphere();
          if (g.boundingSphere && g.boundingSphere.radius > 0.5) {
            window.clearTimeout(t);
            resolve(true);
            return;
          }
        }
        window.setTimeout(check, 400);
      };
      check();
    });
    if (!ok) {
      scene.remove(splat);
      return null;
    }
    return splat;
  } catch {
    return null;
  }
}
