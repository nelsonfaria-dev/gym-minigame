import type { Expression, GymPhase } from '../game/gymGameTypes';

export interface CharacterFrame {
  phase: GymPhase;
  curlProgress: number;
  walkProgress: number;
  fatigue: number;
  expression: Expression;
  reducedMotion: boolean;
  finalRepIntensity?: number;
}
export interface MotionSource {
  get: () => CharacterFrame;
  subscribe: (listener: (frame: CharacterFrame) => void) => () => void;
}
export function createMotionStore(initial: CharacterFrame) {
  let frame = initial;
  const listeners = new Set<(frame: CharacterFrame) => void>();
  return {
    get: () => frame,
    set(next: CharacterFrame) {
      frame = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe(listener: (frame: CharacterFrame) => void) {
      listeners.add(listener);
      listener(frame);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
