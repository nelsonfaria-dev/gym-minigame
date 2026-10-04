import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { gymCopy } from '../game/gymGameConfig';
import type { MotionSource } from '../utils/motionStore';

interface Burst {
  id: number;
  message: string;
  side: string;
  top: number;
  angle: number;
  drift: number;
  size: number;
  color: string;
  movement: string;
  life: number;
}
const slots = [
  { side: 'left', top: 48 },
  { side: 'right', top: 18 },
  { side: 'left', top: 64 },
  { side: 'right', top: 40 },
  { side: 'right', top: 58 },
];
const colors = ['#f5ead3', '#f6bd7b', '#ef8d6b'];
const movements = ['zoom', 'sway', 'float', 'pulse'];

export function FinalRepChaos({
  motion,
  reducedMotion,
}: {
  motion: MotionSource;
  reducedMotion: boolean;
}) {
  const [active, setActive] = useState(
    (motion.get().finalRepIntensity ?? 0) >= 0.55,
  );
  const activeRef = useRef(active);
  const serial = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  useLayoutEffect(
    () =>
      motion.subscribe((frame) => {
        const next = (frame.finalRepIntensity ?? 0) >= 0.55;
        if (activeRef.current !== next) {
          activeRef.current = next;
          if (!next) setBursts([]);
          setActive(next);
        }
      }),
    [motion],
  );

  useEffect(() => {
    if (!active || reducedMotion) return;
    let spawnTimer = 0;
    let expiryTimer = 0;
    let cancelled = false;
    let lastPhrase = -1;
    let lastMovement = -1;
    let nextSide: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';
    const nextSlot = { left: 0, right: 0 };
    const decks = {
      left: slots.filter((slot) => slot.side === 'left'),
      right: slots.filter((slot) => slot.side === 'right'),
    };
    for (const deck of Object.values(decks)) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
    setBursts([]);
    const spawn = () => {
      if (cancelled) return;
      const phrase =
        lastPhrase < 0
          ? Math.floor(Math.random() * gymCopy.finalRepShouts.length)
          : (lastPhrase +
              1 +
              Math.floor(Math.random() * (gymCopy.finalRepShouts.length - 1))) %
            gymCopy.finalRepShouts.length;
      lastPhrase = phrase;
      const deck = decks[nextSide];
      const slot = deck[nextSlot[nextSide]++ % deck.length];
      nextSide = nextSide === 'left' ? 'right' : 'left';
      const life = 1120;
      const movement =
        lastMovement < 0
          ? Math.floor(Math.random() * movements.length)
          : (lastMovement +
              1 +
              Math.floor(Math.random() * (movements.length - 1))) %
            movements.length;
      lastMovement = movement;
      const burst: Burst = {
        id: ++serial.current,
        message: gymCopy.finalRepShouts[phrase],
        ...slot,
        top: slot.top + Math.random() * 6 - 3,
        angle: Math.random() * 12 - 6,
        drift: Math.random() * 16 - 8,
        size: 0.94 + Math.random() * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        movement: movements[movement],
        life,
      };
      setBursts([burst]);
      expiryTimer = window.setTimeout(() => {
        if (!cancelled) setBursts([]);
      }, life);
      spawnTimer = window.setTimeout(spawn, life + 300 + Math.random() * 200);
    };
    spawn();
    return () => {
      cancelled = true;
      window.clearTimeout(spawnTimer);
      window.clearTimeout(expiryTimer);
    };
  }, [active, reducedMotion]);

  if (!active) return null;
  const visibleBursts = reducedMotion
    ? [
        {
          id: -1,
          message: 'DON’T GIVE UP!',
          side: 'left',
          top: 48,
          angle: -7,
          drift: 0,
          size: 1,
          color: colors[0],
          movement: 'none',
          life: 0,
        },
        {
          id: -2,
          message: 'ALMOST THERE!!!',
          side: 'right',
          top: 58,
          angle: 7,
          drift: 0,
          size: 1,
          color: colors[1],
          movement: 'none',
          life: 0,
        },
      ]
    : bursts;
  return (
    <div
      className="gym-experience__chaos"
      aria-hidden="true"
      data-chaos="true"
      data-static={reducedMotion}
    >
      {visibleBursts.map((burst) => (
        <div
          key={burst.id}
          className={`gym-experience__chaos-burst gym-experience__chaos-burst--${burst.side}`}
          data-chaos-burst={burst.id}
          style={
            {
              '--gym-chaos-top': `${burst.top}%`,
              '--gym-chaos-angle': `${burst.angle}deg`,
              '--gym-chaos-drift': `${burst.drift}px`,
              '--gym-chaos-size': burst.size,
              '--gym-chaos-color': burst.color,
              '--gym-chaos-life': `${burst.life}ms`,
            } as CSSProperties
          }
        >
          <p className="gym-experience__shout-text">
            <span
              className="gym-experience__chaos-motion"
              data-movement={burst.movement}
            >
              {burst.message}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
