import { useEffect, useMemo } from 'react';
import type { GymState } from './gymGameTypes';
import { getGameView } from './gymGameReducer';
import { gymGameConfig } from './gymGameConfig';
import { damp } from '../utils/interpolation';
import { createMotionStore } from '../utils/motionStore';
import { getFinalRepIntensity } from './finalRepIntensity';

export function useGymMotion(getState: () => GymState, readyToEnter = true) {
  const motion = useMemo(
    () =>
      createMotionStore({
        phase: 'entering',
        curlProgress: 0,
        walkProgress: 0,
        fatigue: 0,
        expression: 'neutral',
        reducedMotion: getState().reducedMotion,
      }),
    [getState],
  );
  useEffect(() => {
    let frame = 0;
    let previousTime = performance.now();
    const animate = (now: number) => {
      const state = getState();
      if (state.phase === 'closed') return;
      const view = getGameView({
        ...state,
        lastTickAt:
          !readyToEnter && state.phase === 'entering'
            ? state.phaseStartedAt
            : Math.max(state.lastTickAt, now),
      });
      const curlProgress =
        state.reducedMotion ||
        state.phase === 'lowering' ||
        state.phase === 'top'
          ? view.targetCurl
          : damp(
              motion.get().curlProgress,
              view.targetCurl,
              now - previousTime,
              gymGameConfig.smoothingMs,
            );
      motion.set({
        ...view,
        curlProgress,
        phase: state.phase,
        reducedMotion: state.reducedMotion,
        finalRepIntensity: getFinalRepIntensity(state, now),
      });
      previousTime = now;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [getState, motion, readyToEnter]);
  return motion;
}
