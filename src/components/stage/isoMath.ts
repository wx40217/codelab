export const ANGLE_DEG = 25;
export const ANGLE_RAD = (ANGLE_DEG * Math.PI) / 180;
export const COS25 = Math.cos(ANGLE_RAD); // ~0.9063078
export const SIN25 = Math.sin(ANGLE_RAD); // ~0.4226183

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Projects a 3D isometric point (x, y, z) into 2D SVG space.
 * +x goes down-right, +y goes down-left, +z goes straight up.
 */
export function isoProject(x: number, y: number, z = 0): Point2D {
  return {
    x: (x - y) * COS25,
    y: (x + y) * SIN25 - z,
  };
}

export function polyPoints(pts: Point2D[]): string {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

export interface IsoBoxGeometry {
  top: string;
  left: string;
  right: string;
  outline: string;
  shadow: string;
  topCenter: Point2D;
  leftCenter: Point2D;
  rightCenter: Point2D;
  topAnchor: Point2D;
}

/**
 * Computes all SVG polygons and label centers for an isometric prism
 * anchored at local (0, 0, 0) with size (dx, dy, dz).
 */
export function computeIsoBox(dx: number, dy: number, dz: number): IsoBoxGeometry {
  const t00 = isoProject(0, 0, dz);
  const t10 = isoProject(dx, 0, dz);
  const t11 = isoProject(dx, dy, dz);
  const t01 = isoProject(0, dy, dz);

  const b10 = isoProject(dx, 0, 0);
  const b11 = isoProject(dx, dy, 0);
  const b01 = isoProject(0, dy, 0);
  const b00 = isoProject(0, 0, 0);

  // Soft cast shadow shifted slightly down-right on the floor plane
  const shOffset = 6;
  const s00 = isoProject(shOffset, shOffset * 0.4, 0);
  const s10 = isoProject(dx + shOffset, shOffset * 0.4, 0);
  const s11 = isoProject(dx + shOffset, dy + shOffset * 0.4, 0);
  const s01 = isoProject(shOffset, dy + shOffset * 0.4, 0);

  return {
    top: polyPoints([t00, t10, t11, t01]),
    left: polyPoints([t01, t11, b11, b01]),
    right: polyPoints([t11, t10, b10, b11]),
    outline: polyPoints([t00, t10, b10, b11, b01, t01]),
    shadow: polyPoints([s00, s10, s11, s01]),
    topCenter: isoProject(dx / 2, dy / 2, dz),
    leftCenter: isoProject(dx / 2, dy, dz / 2),
    rightCenter: isoProject(dx, dy / 2, dz / 2),
    topAnchor: isoProject(dx / 2, dy / 2, dz),
  };
}

/** SVG matrix transform that lays text flush on the left-front (+x, -z) isometric face */
export function leftFaceTransform(center: Point2D): string {
  return `translate(${center.x.toFixed(2)}, ${center.y.toFixed(2)}) matrix(${COS25.toFixed(4)}, ${SIN25.toFixed(4)}, 0, 1, 0, 0)`;
}

/** SVG matrix transform that lays text flat on the top (+x, +y) isometric face */
export function topFaceTransform(center: Point2D): string {
  return `translate(${center.x.toFixed(2)}, ${center.y.toFixed(2)}) matrix(${COS25.toFixed(4)}, ${SIN25.toFixed(4)}, ${(-COS25).toFixed(4)}, ${SIN25.toFixed(4)}, 0, 0)`;
}
