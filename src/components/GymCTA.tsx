import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import type { MotionSource } from '../utils/motionStore';

export function GymCTA({
  label,
  playable,
  onLift,
  buttonRef,
  motion,
}: {
  label: string;
  playable: boolean;
  onLift: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  motion?: MotionSource;
}) {
  const feedback = useRef({
    heat: 0,
    lastTap: -Infinity,
    previousFrame: 0,
    frame: 0,
    pressure: 0,
    reducedMotion: false,
  });
  useEffect(() => () => cancelAnimationFrame(feedback.current.frame), []);

  const paintFeedback = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const current = feedback.current;
    button.style.setProperty('--gym-button-heat', String(current.heat));
    button.style.setProperty('--gym-quake', String(current.pressure));
    button.dataset.quaking = String(
      button.getAttribute('aria-disabled') === 'false' &&
        current.pressure >= 0.2 &&
        current.heat >= 0.18 &&
        !current.reducedMotion,
    );
  }, [buttonRef]);
  useLayoutEffect(() => {
    paintFeedback();
    return motion?.subscribe((frame) => {
      feedback.current.pressure = frame.finalRepIntensity ?? 0;
      feedback.current.reducedMotion = frame.reducedMotion;
      paintFeedback();
    });
  }, [motion, paintFeedback, playable]);

  function lift() {
    if (!playable) return;
    const now = performance.now();
    const current = feedback.current;
    const rapid = now - current.lastTap < 270;
    current.heat = Math.min(1, current.heat + (rapid ? 0.2 : 0.08));
    current.lastTap = now;
    paintFeedback();
    if (!current.frame) {
      current.previousFrame = now;
      const cool = (time: number) => {
        const coolingMs = Math.max(
          0,
          time - Math.max(current.previousFrame, current.lastTap + 180),
        );
        current.heat = Math.max(0, current.heat - coolingMs * 0.0007);
        current.previousFrame = time;
        paintFeedback();
        current.frame = current.heat > 0 ? requestAnimationFrame(cool) : 0;
      };
      current.frame = requestAnimationFrame(cool);
    }
    onLift();
  }

  return (
    <button
      type="button"
      ref={buttonRef}
      className="gym-experience__cta"
      aria-disabled={!playable}
      onClick={lift}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          if (!event.repeat) lift();
        }
      }}
      onKeyUp={(event) => {
        if (event.key === ' ') event.preventDefault();
      }}
    >
      <span className="gym-experience__cta-trail" aria-hidden="true">
        <span className="gym-experience__cta-outline" />
      </span>
      <span className="gym-experience__cta-tremor">
        <span className="gym-experience__cta-surface">
          <span className="gym-experience__cta-label">{label}</span>
          <span className="gym-experience__cta-arrow" aria-hidden="true">
            ↑
          </span>
        </span>
      </span>
    </button>
  );
}
