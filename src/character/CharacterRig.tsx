import { useLayoutEffect, useRef } from 'react';
import {
  characterCanvas as canvas,
  characterFrameConfig,
  faceAssets,
  type CharacterBodyFrame,
} from './characterFrameConfig';
import { getBodyFrameIndex } from './characterFrames';
import type { CharacterFrame, MotionSource } from '../utils/motionStore';
import type { Expression } from '../game/gymGameTypes';

export interface CharacterRigProps extends CharacterFrame {
  motion?: MotionSource;
  frames?: readonly CharacterBodyFrame[];
}
export function CharacterRig({
  motion,
  frames = characterFrameConfig,
  ...pose
}: CharacterRigProps) {
  const root = useRef<SVGSVGElement>(null);
  const bodyLayers = useRef<(SVGImageElement | null)[]>([]);
  const faceLayers = useRef<
    Partial<Record<Expression, SVGImageElement | null>>
  >({});
  const faceGroup = useRef<SVGGElement>(null);
  const {
    phase,
    curlProgress,
    walkProgress,
    fatigue,
    expression,
    reducedMotion,
  } = pose;
  useLayoutEffect(() => {
    const apply = (frame: CharacterFrame) => {
      const index = getBodyFrameIndex(frame.curlProgress);
      const alignment = frames[index].face;
      bodyLayers.current.forEach((image, i) => {
        if (image) image.style.visibility = i === index ? 'visible' : 'hidden';
      });
      for (const value of Object.keys(faceAssets) as Expression[]) {
        const image = faceLayers.current[value];
        if (image)
          image.style.visibility =
            value === frame.expression ? 'visible' : 'hidden';
      }
      faceGroup.current!.setAttribute(
        'transform',
        `translate(${alignment.x} ${alignment.y}) rotate(${alignment.rotate}) scale(${alignment.scale})`,
      );
      root.current!.dataset.bodyFrame = String(index + 1);
      root.current!.dataset.expression = frame.expression;
    };
    if (motion) return motion.subscribe(apply);
    apply({
      phase,
      curlProgress,
      walkProgress,
      fatigue,
      expression,
      reducedMotion,
    });
  }, [
    motion,
    frames,
    phase,
    curlProgress,
    walkProgress,
    fatigue,
    expression,
    reducedMotion,
  ]);
  return (
    <svg
      ref={root}
      className="gym-experience__rig"
      viewBox={`0 0 ${canvas.width} ${canvas.height}`}
      width={canvas.width}
      height={canvas.height}
      aria-hidden="true"
      focusable="false"
    >
      {frames.map((frame, index) => (
        <image
          key={frame.src}
          ref={(element) => {
            bodyLayers.current[index] = element;
          }}
          data-body={index}
          href={frame.src}
          {...canvas.body}
          preserveAspectRatio="xMidYMid meet"
          style={{ visibility: 'hidden' }}
        />
      ))}
      <g ref={faceGroup} data-face-layer="true">
        {(Object.keys(faceAssets) as Expression[]).map((value) => (
          <image
            key={value}
            ref={(element) => {
              faceLayers.current[value] = element;
            }}
            data-face={value}
            href={faceAssets[value].src}
            {...faceAssets[value].placement}
            preserveAspectRatio="xMidYMid meet"
            style={{ visibility: 'hidden' }}
          />
        ))}
      </g>
    </svg>
  );
}
