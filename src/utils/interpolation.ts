export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
export const easeInOut = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export const damp = (
  current: number,
  target: number,
  elapsedMs: number,
  smoothingMs: number,
) => {
  const next =
    target +
    (current - target) * Math.exp(-Math.max(0, elapsedMs) / smoothingMs);
  return Math.abs(next - target) < 0.001 ? target : next;
};
