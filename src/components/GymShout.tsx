import { useState, type CSSProperties } from 'react';
import { totalReps } from '../game/gymGameConfig';

const positions = [
  { side: 'left', top: 10, angle: -8 },
  { side: 'right', top: 13, angle: 7 },
  { side: 'left', top: 32, angle: -5 },
  { side: 'right', top: 35, angle: 5 },
  { side: 'left', top: 21, angle: -10 },
  { side: 'right', top: 24, angle: 9 },
] as const;

export function GymShout({
  message,
  repIndex,
  active,
}: {
  message: string;
  repIndex: number;
  active: boolean;
}) {
  const [deck] = useState(() => {
    const shuffled = [...positions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const movements = ['zoom', 'sway', 'slide', 'shake'];
    for (let i = movements.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movements[i], movements[j]] = [movements[j], movements[i]];
    }
    return shuffled.map((position, index) => ({
      ...position,
      movement: movements[index % movements.length],
    }));
  });
  if (!active) return null;
  const position = deck[repIndex % deck.length];
  const sentences = message.split(/(?<=[.!?])\s+/);

  return (
    <div
      key={repIndex}
      className={`gym-experience__shout gym-experience__shout--${position.side}`}
      aria-hidden="true"
      data-final-rep={repIndex === totalReps() - 1}
      style={
        {
          '--gym-shout-top': `${position.top}%`,
          '--gym-shout-angle': `${position.angle}deg`,
          '--gym-shout-energy':
            repIndex < 4 ? 0.25 : 0.65 + (repIndex - 4) * 0.3,
          '--gym-shout-duration': `${repIndex < 4 ? 2000 : 1700 - (repIndex - 4) * 150}ms`,
          '--gym-shout-shake-duration': `${repIndex < 4 ? 900 : 220 - (repIndex - 4) * 30}ms`,
        } as CSSProperties
      }
    >
      <div
        className="gym-experience__shout-motion"
        data-movement={position.movement}
      >
        <p className="gym-experience__shout-text">
          {sentences.map((sentence, index) => (
            <span
              key={index}
              className={index > 0 ? 'gym-experience__shout-punch' : undefined}
            >
              {sentence}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
