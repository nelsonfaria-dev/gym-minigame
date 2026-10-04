import { useEffect, useId, useRef, useState } from 'react';
import { CharacterRig } from './CharacterRig';
import { faceAssets } from './characterFrameConfig';
import {
  celebrationPoses,
  celebrationTimings,
  sunglassesPlacement,
  type CelebrationPose,
} from './celebrationConfig';
import type { MotionSource } from '../utils/motionStore';

function FloorDumbbell({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 768) rotate(-4)`}>
      <rect
        x="-28"
        y="-4"
        width="56"
        height="9"
        rx="2"
        fill="#777d85"
        stroke="#20232c"
        strokeWidth="2"
      />
      {[-31, 22].map((plate) => (
        <g key={plate} transform={`translate(${plate} -18)`}>
          <path
            d="M4 0H15L20 6V30L15 36H4L0 30V6Z"
            fill="#252931"
            stroke="#141923"
            strokeWidth="2"
          />
          <path d="M5 4H13L16 8V28L13 31H5Z" fill="#343840" />
        </g>
      ))}
    </g>
  );
}

export function GymCelebration({
  motion,
  reducedMotion,
}: {
  motion: MotionSource;
  reducedMotion: boolean;
}) {
  const [pose, setPose] = useState<CelebrationPose>(
    reducedMotion ? 'flex' : 'rest',
  );
  const id = useId();
  const completed = useRef(reducedMotion);
  useEffect(() => {
    if (reducedMotion) {
      completed.current = true;
      setPose('flex');
      return;
    }
    if (completed.current) return;
    const timers = [
      window.setTimeout(() => setPose('set-down'), celebrationTimings.setDown),
      window.setTimeout(
        () => setPose('glasses-lift'),
        celebrationTimings.glassesLift,
      ),
      window.setTimeout(
        () => setPose('glasses-raise'),
        celebrationTimings.glassesRaise,
      ),
      window.setTimeout(() => setPose('glasses'), celebrationTimings.glasses),
      window.setTimeout(() => {
        completed.current = true;
        setPose('flex');
      }, celebrationTimings.flex),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reducedMotion]);

  const displayed = reducedMotion ? 'flex' : pose;
  if (displayed === 'rest')
    return <CharacterRig {...motion.get()} motion={motion} />;
  const alignment = celebrationPoses[displayed];
  return (
    <svg
      className="gym-experience__rig gym-experience__celebration"
      viewBox="0 0 400 800"
      width="400"
      height="800"
      aria-hidden="true"
      focusable="false"
      data-ending-pose={displayed}
      data-expression="neutral"
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <rect
            x={alignment.imageX + alignment.crop.x}
            y="0"
            width={alignment.crop.width}
            height="800"
          />
        </clipPath>
        <clipPath id={`${id}-hands`}>
          <rect x="127" y="15" width="51" height="126" />
          <rect x="222" y="15" width="51" height="126" />
        </clipPath>
        <linearGradient id={`${id}-lens`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#415b69" />
          <stop offset="0.55" stopColor="#101a27" />
          <stop offset="1" stopColor="#232431" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="786" rx="153" ry="8" fill="#080e19" opacity="0.3" />
      {displayed !== 'set-down' && (
        <g className="gym-experience__floor-weights" data-floor-weights>
          <FloorDumbbell x={43} />
          <FloorDumbbell x={345} />
        </g>
      )}
      <g
        key={displayed}
        className={`gym-experience__ending-pose gym-experience__ending-pose--${displayed}`}
      >
        <g clipPath={`url(#${id}-body)`}>
          <image
            href={alignment.src}
            x={alignment.imageX}
            y={alignment.imageY}
            width="1200"
            height="800"
            preserveAspectRatio="none"
          />
        </g>
        <g
          transform={`translate(${alignment.jawX} ${alignment.jawY}) scale(${alignment.scale})`}
        >
          <image
            data-celebration-face
            href={faceAssets.neutral.src}
            {...faceAssets.neutral.placement}
          />
          {displayed !== 'set-down' && (
            <g
              className="gym-experience__sunglasses"
              data-sunglasses
              transform={`translate(${sunglassesPlacement.x} ${sunglassesPlacement.y + alignment.glassesOffsetY}) scale(${sunglassesPlacement.scaleX} 1)`}
            >
              <g className="gym-experience__sunglasses-fit">
                <path
                  d="M-42-5L-36-1M36-1L42-5"
                  fill="none"
                  stroke="#191d28"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  data-sunglasses-lenses
                  d="M-35-8Q-22-11-8-7L-7 4Q-10 13-24 12Q-34 11-35 3ZM8-7Q22-11 35-8L35 3Q34 11 24 12Q10 13 7 4Z"
                  fill={`url(#${id}-lens)`}
                  stroke="#181c26"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M-8-5Q0-8 8-5"
                  fill="none"
                  stroke="#181c26"
                  strokeWidth="4"
                />
                <path
                  d="M-31-4L-17-6M12-4L26-6"
                  fill="none"
                  stroke="#aacbd7"
                  strokeWidth="2"
                  opacity="0.5"
                  strokeLinecap="round"
                />
                <path d="M-36-6H-32M32-6H36" stroke="#d3b68a" strokeWidth="2" />
              </g>
            </g>
          )}
        </g>
        {displayed.startsWith('glasses') && (
          <g clipPath={`url(#${id}-hands)`} data-gripping-hands>
            <image
              href={alignment.src}
              x={alignment.imageX}
              y={alignment.imageY}
              width="1200"
              height="800"
              preserveAspectRatio="none"
            />
          </g>
        )}
      </g>
    </svg>
  );
}
