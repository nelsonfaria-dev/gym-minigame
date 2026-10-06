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
  slot: string;
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
  const liftProgress = useRef(motion.get().curlProgress);
  const serial = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  useLayoutEffect(
    () =>
      motion.subscribe((frame) => {
        liftProgress.current = frame.curlProgress;
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
    const expiryTimers = new Set<number>();
    let liveBursts: Burst[] = [];
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
    const takeSlot = (side: 'left' | 'right') => {
      const deck = decks[side];
      for (let attempt = 0; attempt < deck.length; attempt++) {
        const slot = deck[nextSlot[side]++ % deck.length];
        if (
          !liveBursts.some((burst) => burst.slot === `${slot.side}-${slot.top}`)
        )
          return slot;
      }
    };
    const spawn = () => {
      if (cancelled) return;
      const slot =
        takeSlot(nextSide) ?? takeSlot(nextSide === 'left' ? 'right' : 'left');
      if (!slot) {
        spawnTimer = window.setTimeout(spawn, 80);
        return;
      }
      const phrase =
        lastPhrase < 0
          ? Math.floor(Math.random() * gymCopy.finalRepShouts.length)
          : (lastPhrase +
              1 +
              Math.floor(Math.random() * (gymCopy.finalRepShouts.length - 1))) %
            gymCopy.finalRepShouts.length;
      lastPhrase = phrase;
      nextSide = slot.side === 'left' ? 'right' : 'left';
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
        slot: `${slot.side}-${slot.top}`,
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
      liveBursts = [...liveBursts, burst];
      setBursts(liveBursts);
      const expiryTimer = window.setTimeout(() => {
        expiryTimers.delete(expiryTimer);
        if (cancelled) return;
        liveBursts = liveBursts.filter((item) => item.id !== burst.id);
        setBursts(liveBursts);
      }, life);
      expiryTimers.add(expiryTimer);
      const progress = Math.min(
        1,
        Math.max(0, (liftProgress.current - 0.2) / 0.6),
      );
      const interval = 1480 - 1200 * Math.sqrt(progress) + Math.random() * 80;
      spawnTimer = window.setTimeout(spawn, interval);
    };
    spawn();
    return () => {
      cancelled = true;
      window.clearTimeout(spawnTimer);
      expiryTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [active, reducedMotion]);

  if (!active) return null;
  const visibleBursts = reducedMotion
    ? [
        {
          id: -1,
          slot: 'static-left',
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
          slot: 'static-right',
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
          data-chaos-slot={burst.slot}
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
