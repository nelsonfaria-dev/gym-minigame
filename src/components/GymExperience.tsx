import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useGymGame } from '../game/useGymGame';
import { useGymMotion } from '../game/useGymMotion';
import { getGameView } from '../game/gymGameReducer';
import { gymCopy, gymGameConfig, totalReps } from '../game/gymGameConfig';
import { useReducedMotion } from '../utils/useReducedMotion';
import { GymStage } from './GymStage';
import { GymHUD } from './GymHUD';
import { GymCTA } from './GymCTA';
import { EffortMeter } from './EffortMeter';
import { GymResult } from './GymResult';
import { GymLeaderboard } from './GymLeaderboard';
import type { GymLeaderboardAdapter } from '../leaderboard/types.js';
import { useCharacterAssets } from '../character/useCharacterAssets';

export interface GymExperienceProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  returnFocusRef?: RefObject<HTMLElement | null>;
  leaderboard?: GymLeaderboardAdapter;
}

export function GymExperience(props: GymExperienceProps) {
  const reducedMotion = useReducedMotion();
  return props.open ? (
    <GymSession {...props} reducedMotion={reducedMotion} />
  ) : null;
}

function GymSession({
  onClose,
  onComplete,
  returnFocusRef,
  leaderboard,
  reducedMotion,
}: GymExperienceProps & { reducedMotion: boolean }) {
  const assets = useCharacterAssets();
  const game = useGymGame(reducedMotion, assets.status === 'ready');
  const { state, send, getState, didComplete } = game;
  const view = getGameView(state);
  const motion = useGymMotion(getState, assets.status === 'ready');
  const cta = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const resultButton = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  const closed = useRef(false);
  const [showGo, setShowGo] = useState(false);
  const callbacks = useRef({ onClose, onComplete });
  callbacks.current = { onClose, onComplete };
  const instructionId = useId();
  const close = () => send({ type: 'close', now: performance.now() });

  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const triggerAtOpen = returnFocusRef?.current;
    cta.current?.focus({ preventScroll: true });
    return () => {
      const target = triggerAtOpen ?? previous;
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [returnFocusRef]);
  useEffect(() => {
    if (state.phase === 'entering') {
      completed.current = false;
      closed.current = false;
    }
    if (didComplete() && !completed.current) {
      completed.current = true;
      resultButton.current?.focus({ preventScroll: true });
      callbacks.current.onComplete?.();
    }
    if (state.phase === 'closed' && !closed.current) {
      closed.current = true;
      callbacks.current.onClose();
    }
  }, [state.phase, didComplete]);

  useEffect(() => {
    const starting = state.phase === 'lifting' && state.repIndex === 0;
    setShowGo(starting);
    if (!starting) return;
    const timer = window.setTimeout(() => setShowGo(false), 750);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.phaseStartedAt, state.repIndex]);

  const finished =
    state.phase === 'finished' ||
    (state.phase === 'exiting' && completed.current);
  const status =
    state.phase === 'entering' && assets.status === 'ready'
      ? 'READY'
      : state.phase === 'top'
        ? '+1 REP'
        : showGo
          ? 'GO!'
          : '';
  const announcement = finished
    ? `Workout complete. ${totalReps()} reps.`
    : state.phase === 'lifting' && state.repIndex === 0
      ? `${totalReps()} reps. Keep tapping to lift.`
      : state.completedReps > 0
        ? `Rep ${state.completedReps} complete.`
        : 'Gym workout. Tap repeatedly to lift.';

  return (
    <div
      ref={root}
      className="gym-experience"
      role="dialog"
      aria-label="Gym workout"
      aria-modal="false"
      aria-describedby={instructionId}
      data-phase={state.phase}
      data-reduced-motion={reducedMotion}
      data-assets={assets.status}
      data-leaderboard={Boolean(leaderboard && finished)}
      style={
        {
          '--gym-enter-ms': `${gymGameConfig.reducedEntryMs}ms`,
          '--gym-exit-ms': `${gymGameConfig.exitDurationMs}ms`,
        } as React.CSSProperties
      }
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          close();
        }
        if (event.key === 'Tab') {
          const buttons = Array.from(
            root.current!.querySelectorAll<HTMLButtonElement>(
              'button:not([disabled])',
            ),
          );
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }}
    >
      <button
        ref={closeButton}
        type="button"
        className="gym-experience__close"
        aria-label="Close gym experience"
        onClick={close}
      >
        <Cross1Icon aria-hidden="true" />
      </button>
      <p id={instructionId} className="gym-experience__sr-only">
        Tap the lift button repeatedly, or use Enter and Space. Eight reps, each
        harder than the last. Escape closes the workout.
      </p>
      <div
        className="gym-experience__live gym-experience__sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
      <div className="gym-experience__composition">
        <div className="gym-experience__progress">
          <GymHUD state={state} />
          {!finished && <EffortMeter motion={motion} effort={state.effort} />}
        </div>
        <GymStage
          motion={motion}
          finished={finished}
          reducedMotion={reducedMotion}
          visible={assets.status === 'ready'}
          message={view.message}
          repIndex={state.repIndex}
          showMessage={
            state.phase === 'lifting' ||
            state.phase === 'top' ||
            state.phase === 'lowering'
          }
        />
        {finished ? (
          <GymResult onReturn={close} buttonRef={resultButton} />
        ) : (
          <div className="gym-experience__controls">
            <div className="gym-experience__copy">
              <span
                className={`gym-experience__status${status === 'READY' || status === 'GO!' ? ' gym-experience__status--start' : ''}`}
              >
                {status}
              </span>
              <p
                className={
                  assets.status === 'error'
                    ? undefined
                    : 'gym-experience__sr-only'
                }
              >
                {assets.status === 'error'
                  ? 'Character could not load. Try again.'
                  : view.message}
              </p>
            </div>
            <GymCTA
              motion={motion}
              label={assets.status === 'error' ? 'RETRY' : view.cta}
              playable={assets.status === 'error' || state.phase === 'lifting'}
              onLift={() =>
                assets.status === 'error'
                  ? assets.retry()
                  : send({ type: 'lift', now: performance.now() })
              }
              buttonRef={cta}
            />
            <span className="gym-experience__hint">{gymCopy.firstRepHint}</span>
          </div>
        )}
        {finished && leaderboard && (
          <GymLeaderboard
            adapter={leaderboard}
            durationMs={state.workoutDurationMs}
          />
        )}
      </div>
    </div>
  );
}
