import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialState,
  gymGameReducer,
  phaseDuration,
  workoutCompletionTime,
} from './gymGameReducer';
import type { GymAction } from './gymGameTypes';

export function useGymGame(reducedMotion: boolean, readyToEnter = true) {
  const [state, setState] = useState(() =>
    gymGameReducer(createInitialState(), {
      type: 'open',
      now: performance.now(),
      reducedMotion,
    }),
  );
  const current = useRef(state);
  const workoutCompleted = useRef(false);
  const entranceStarted = useRef(readyToEnter);
  const getState = useCallback(() => current.current, []);
  const didComplete = useCallback(() => workoutCompleted.current, []);
  const send = useCallback((action: GymAction) => {
    const previous = current.current;
    if (action.type === 'tick') {
      const milestone = workoutCompletionTime(previous);
      if (milestone !== null && action.now >= milestone)
        workoutCompleted.current = true;
    }
    const next = gymGameReducer(previous, action);
    current.current = next;
    if (
      action.type !== 'tick' ||
      previous.phase !== next.phase ||
      previous.repIndex !== next.repIndex
    ) {
      setState(next);
    }
  }, []);

  useEffect(() => {
    if (getState().reducedMotion !== reducedMotion)
      send({ type: 'motionPreference', reducedMotion });
  }, [reducedMotion, getState, send]);

  useEffect(() => {
    if (!readyToEnter || entranceStarted.current) return;
    entranceStarted.current = true;
    if (getState().phase === 'entering')
      send({ type: 'open', now: performance.now(), reducedMotion });
  }, [readyToEnter, reducedMotion, getState, send]);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const currentState = getState();
      if (currentState.phase === 'entering' && !readyToEnter) return;
      const duration = phaseDuration(currentState);
      if (duration === null) return;
      const deadline = currentState.phaseStartedAt + duration;
      timer = window.setTimeout(
        () => {
          send({ type: 'tick', now: Math.max(deadline, performance.now()) });
          schedule();
        },
        Math.max(0, deadline - performance.now()),
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [
    state.phase,
    state.phaseStartedAt,
    state.reducedMotion,
    readyToEnter,
    getState,
    send,
  ]);

  useEffect(() => {
    if (state.phase !== 'lifting') return;
    let frame = 0;
    const update = (now: number) => {
      send({ type: 'tick', now });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [state.phase, send]);

  return { state, getState, didComplete, send };
}
