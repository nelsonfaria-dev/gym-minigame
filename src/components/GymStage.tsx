import { useLayoutEffect, useRef } from 'react';
import { CharacterRig } from '../character/CharacterRig';
import { GymCelebration } from '../character/GymCelebration';
import type { MotionSource } from '../utils/motionStore';
import { GymShout } from './GymShout';
import { FinalRepChaos } from './FinalRepChaos';

export function GymStage({
  motion,
  visible = true,
  message,
  repIndex,
  showMessage,
  finished,
  reducedMotion,
}: {
  motion: MotionSource;
  visible?: boolean;
  message: string;
  repIndex: number;
  showMessage: boolean;
  finished: boolean;
  reducedMotion: boolean;
}) {
  const traveler = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () =>
      motion.subscribe((frame) => {
        const offset = frame.reducedMotion ? 0 : (frame.walkProgress - 1) * 100;
        traveler.current!.style.transform = `translateX(${offset}cqw)`;
        traveler.current!.style.opacity =
          frame.phase === 'entering' && !frame.reducedMotion
            ? String(Math.min(1, frame.walkProgress * 8))
            : '1';
      }),
    [motion],
  );
  return (
    <div
      className="gym-experience__stage"
      aria-hidden="true"
      style={{ visibility: visible ? 'visible' : 'hidden' }}
    >
      <GymShout
        message={message}
        repIndex={repIndex}
        active={visible && showMessage}
      />
      {visible && !finished && (
        <FinalRepChaos motion={motion} reducedMotion={reducedMotion} />
      )}
      <div ref={traveler} className="gym-experience__traveler">
        {visible &&
          (finished ? (
            <GymCelebration motion={motion} reducedMotion={reducedMotion} />
          ) : (
            <CharacterRig {...motion.get()} motion={motion} />
          ))}
      </div>
    </div>
  );
}
