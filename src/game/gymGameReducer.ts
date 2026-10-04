import {
  gymCopy,
  gymGameConfig as config,
  totalReps,
  getRepDifficulty,
  getLiftImpulse,
} from './gymGameConfig';
import type { GymAction, GymGameView, GymState } from './gymGameTypes';
import { clamp, easeInOut } from '../utils/interpolation';

export function createInitialState(): GymState {
  return {
    phase: 'closed',
    repIndex: 0,
    completedReps: 0,
    effort: 0,
    phaseStartedAt: 0,
    lastInputAt: 0,
    lastTickAt: 0,
    reducedMotion: false,
  };
}

export function phaseDuration(state: GymState): number | null {
  switch (state.phase) {
    case 'entering':
      return state.reducedMotion
        ? config.reducedEntryMs
        : config.entryDurationMs;
    case 'ready':
      return config.readyDurationMs;
    case 'top':
      return config.topHoldMs;
    case 'lowering':
      return config.loweringDurationMs;
    case 'exiting':
      return config.exitDurationMs;
    default:
      return null;
  }
}
export function workoutCompletionTime(state: GymState): number | null {
  if (state.completedReps < totalReps()) return null;
  if (state.phase === 'top')
    return state.phaseStartedAt + config.topHoldMs + config.loweringDurationMs;
  if (state.phase === 'lowering')
    return state.phaseStartedAt + config.loweringDurationMs;
  if (state.phase === 'finished') return state.phaseStartedAt;
  return null;
}

function advancePhase(state: GymState, now: number): GymState {
  const base = {
    ...state,
    phaseStartedAt: now,
    lastInputAt: now,
    lastTickAt: now,
  };
  switch (state.phase) {
    case 'entering':
      return { ...base, phase: 'ready' };
    case 'ready':
      return { ...base, phase: 'lifting' };
    case 'top':
      return { ...base, phase: 'lowering' };
    case 'lowering': {
      if (state.completedReps < totalReps()) {
        return {
          ...base,
          phase: 'lifting',
          repIndex: state.repIndex + 1,
          effort: 0,
        };
      }
      return {
        ...base,
        phase: 'finished',
        effort: 0,
      };
    }
    case 'exiting':
      return createInitialState();
    default:
      return state;
  }
}

function advanceTime(state: GymState, now: number): GymState {
  if (state.phase === 'closed' || now <= state.lastTickAt) return state;
  let next = state;
  let duration = phaseDuration(next);
  while (duration !== null && now >= next.phaseStartedAt + duration) {
    next = advancePhase(next, next.phaseStartedAt + duration);
    if (next.phase === 'closed') return next;
    duration = phaseDuration(next);
  }
  if (next.phase === 'lifting') {
    const difficulty = getRepDifficulty(next);
    const decayFrom = Math.max(
      next.lastTickAt,
      next.lastInputAt + difficulty.idleGraceMs,
    );
    const elapsed = Math.max(0, now - decayFrom) / 1000;
    const idleDropFrom = Math.max(
      next.lastTickAt,
      next.lastInputAt + config.idleDrop.delayMs,
    );
    const idleElapsed = Math.max(0, now - idleDropFrom) / 1000;
    next = {
      ...next,
      effort: clamp(
        next.effort -
          elapsed * difficulty.decayPerSecond -
          idleElapsed * config.idleDrop.extraDecayPerSecond,
      ),
    };
  }
  return { ...next, lastTickAt: now };
}

export function gymGameReducer(state: GymState, action: GymAction): GymState {
  if (action.type === 'open') {
    return {
      ...createInitialState(),
      phase: 'entering',
      phaseStartedAt: action.now,
      lastInputAt: action.now,
      lastTickAt: action.now,
      reducedMotion: action.reducedMotion,
    };
  }
  if (action.type === 'motionPreference')
    return { ...state, reducedMotion: action.reducedMotion };
  if (action.type === 'close') {
    if (state.phase === 'closed' || state.phase === 'exiting') return state;
    return {
      ...state,
      phase: 'exiting',
      phaseStartedAt: action.now,
      lastTickAt: action.now,
    };
  }
  if (action.type === 'tick') return advanceTime(state, action.now);
  const next = advanceTime(state, action.now);
  if (next.phase !== 'lifting') return next;
  const effort = clamp(next.effort + getLiftImpulse(next, action.now));
  if (effort < 1) return { ...next, effort, lastInputAt: action.now };
  return {
    ...next,
    effort: 1,
    phase: 'top',
    completedReps: next.completedReps + 1,
    phaseStartedAt: action.now,
    lastInputAt: action.now,
  };
}

export function getGameView(state: GymState): GymGameView {
  const elapsed = state.lastTickAt - state.phaseStartedAt;
  const targetCurl =
    state.phase === 'lowering'
      ? 1 - easeInOut(elapsed / config.loweringDurationMs)
      : state.phase === 'top'
        ? 1
        : state.phase === 'lifting'
          ? state.effort
          : 0;
  const fatigue = clamp(
    (state.completedReps +
      (state.phase === 'lifting' ? state.effort * 0.5 : 0)) /
      totalReps(),
  );
  const recovered =
    state.phase === 'finished' ||
    (state.phase === 'exiting' && state.completedReps === totalReps());
  return {
    targetCurl,
    walkProgress:
      state.phase === 'entering' && !state.reducedMotion
        ? easeInOut(elapsed / config.entryDurationMs)
        : 1,
    fatigue,
    expression: recovered
      ? 'neutral'
      : fatigue >= config.expression.exhaustedBaselineFatigue ||
          (fatigue >= config.expression.strainBaselineFatigue &&
            targetCurl >= config.expression.exhaustedCurl)
        ? 'exhausted'
        : fatigue >= config.expression.strainBaselineFatigue ||
            targetCurl >= config.expression.strainCurl
          ? 'strain'
          : 'neutral',
    cta: getRepDifficulty(state).cta,
    message: gymCopy.messagesByRep[state.repIndex],
  };
}
