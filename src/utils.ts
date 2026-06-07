/** Convert pixel distance to human-readable string based on scale (px per meter) */
export function pxToLabel(px: number, scale: number): string {
  const meters = px / scale;
  if (meters >= 1) return `${meters.toFixed(2)} מ'`;
  return `${(meters * 100).toFixed(1)} ס"מ`;
}

/** Calculate pixel length of a wall */
export function wallLength(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Wall angle in degrees */
export function wallAngle(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
}
