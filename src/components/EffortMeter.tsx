import { useLayoutEffect, useRef } from 'react';
import type { MotionSource } from '../utils/motionStore';

export function EffortMeter({
  motion,
  effort,
}: {
  motion: MotionSource;
  effort: number;
}) {
  const fill = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let lastAccessibleUpdate = 0;
    return motion.subscribe((frame) => {
      fill.current!.style.transform = `scaleX(${frame.curlProgress})`;
      fill.current!.style.setProperty(
        '--gym-effort',
        String(frame.curlProgress),
      );
      const now = performance.now();
      const value = Math.round(frame.curlProgress * 100);
      if (now - lastAccessibleUpdate >= 100 || value === 0 || value === 100) {
        track.current!.setAttribute('aria-valuenow', String(value));
        lastAccessibleUpdate = now;
      }
    });
  }, [motion]);
  return (
    <div className="gym-experience__effort">
      <span className="gym-experience__micro">EFFORT</span>
      <div
        ref={track}
        className="gym-experience__track"
        role="meter"
        aria-label="Rep effort"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(effort * 100)}
      >
        <span ref={fill} className="gym-experience__fill" />
      </div>
    </div>
  );
}
