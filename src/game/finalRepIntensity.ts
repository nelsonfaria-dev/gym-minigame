import { gymGameConfig, totalReps } from './gymGameConfig';
import type { GymState } from './gymGameTypes';
import { clamp } from '../utils/interpolation';
export function getFinalRepIntensity(state: GymState, now: number) {
  if (state.phase !== 'lifting' || state.repIndex !== totalReps() - 1) return 0;
  const lifting = clamp(state.effort / 0.22);
  const idle = Math.max(
    0,
    now - state.lastInputAt - gymGameConfig.idleDrop.delayMs,
  );
  const recentInput = clamp(1 - idle / 120);
  const lateRelief = 1 - clamp((state.effort - 0.7) / 0.3) * 0.15;
  return lifting * recentInput * lateRelief;
}
