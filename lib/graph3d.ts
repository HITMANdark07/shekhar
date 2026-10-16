export type Vec3 = [number, number, number];

/** Rotate around the vertical axis (yaw), then the horizontal axis (pitch). */
export function rotate([x, y, z]: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
}

export interface Camera {
  width: number;
  height: number;
  /** Camera distance in unit-cube units; larger = flatter perspective. */
  distance: number;
  zoom: number;
}

/** Perspective projection: +z points at the viewer, so nearer points get a larger scale. */
export function project([x, y, z]: Vec3, cam: Camera): { x: number; y: number; scale: number } {
  const scale = (cam.distance / (cam.distance - z)) * cam.zoom;
  const base = Math.min(cam.width, cam.height) * 0.42;
  return { x: cam.width / 2 + x * base * scale, y: cam.height / 2 + y * base * scale, scale };
}

export interface ScreenNode {
  id: string;
  x: number;
  y: number;
  r: number;
  depth: number;
}

/** The node under the pointer (with a little slack), preferring the one nearest the camera. */
export function pickNode(nodes: ScreenNode[], x: number, y: number): string | null {
  let best: ScreenNode | null = null;
  for (const n of nodes) {
    if (Math.hypot(n.x - x, n.y - y) > n.r + 6) continue;
    if (!best || n.depth > best.depth) best = n;
  }
  return best?.id ?? null;
}
