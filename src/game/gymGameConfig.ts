export const gymGameConfig = {
  entryDurationMs: 1600,
  reducedEntryMs: 120,
  readyDurationMs: 450,
  topHoldMs: 180,
  loweringDurationMs: 480,
  resultActionDelayMs: 1200,
  exitDurationMs: 180,
  smoothingMs: 65,
  idleDrop: {
    delayMs: 250,
    extraDecayPerSecond: 1.1,
  },
  finalRepCadence: {
    startsAt: 0.45,
    fullAt: 0.5,
    fastIntervalMs: 125,
    slowIntervalMs: 140,
    slowGainPerSecond: 0.145,
    fastGainPerSecond: 0.25,
    response: 0.5,
  },
  finalRepAssist: {
    startsAt: 0.68,
    fullAt: 0.75,
    extraImpulse: 0.036,
    maxGainPerSecond: 0.265,
    extraGainPerSecond: 0.16,
  },
  repDifficulties: [
    {
      impulsePerInput: 0.25,
      decayPerSecond: 0.08,
      idleGraceMs: 170,
      cta: 'LIFT',
    },
    {
      impulsePerInput: 0.2,
      decayPerSecond: 0.1,
      idleGraceMs: 150,
      cta: 'LIFT',
    },
    {
      impulsePerInput: 0.15,
      decayPerSecond: 0.12,
      idleGraceMs: 120,
      cta: 'LIFT',
    },
    {
      impulsePerInput: 0.11,
      decayPerSecond: 0.14,
      idleGraceMs: 90,
      cta: 'PUSH',
    },
    {
      impulsePerInput: 0.08,
      decayPerSecond: 0.16,
      idleGraceMs: 60,
      cta: 'PUSH',
    },
    {
      impulsePerInput: 0.07,
      decayPerSecond: 0.17,
      idleGraceMs: 50,
      cta: 'KEEP GOING',
    },
    {
      impulsePerInput: 0.06,
      decayPerSecond: 0.18,
      idleGraceMs: 35,
      cta: 'KEEP GOING',
    },
    {
      impulsePerInput: 0.054,
      decayPerSecond: 0.18,
      idleGraceMs: 0,
      cta: 'ONE MORE',
    },
  ],
  expression: {
    strainCurl: 0.65,
    strainBaselineFatigue: 5 / 8,
    exhaustedCurl: 0.75,
    exhaustedBaselineFatigue: 7 / 8,
  },
};
export const gymCopy = {
  messagesByRep: [
    'These arms won’t grow themselves.',
    'Okay, we’ve got this.',
    'That’s it. Make every rep count.',
    'Those grocery bags weigh more than this. Come on!!!',
    'Halfway. Don’t you dare quit.',
    '3 more to go. Come on!',
    'TWO LEFT. GO GO GO!',
    'ONE MORE. Everything you’ve got!',
  ],
  resultTitle: 'Workout done!',
  finalRepShouts: [
    'GO GO',
    'ALMOST THERE!!!',
    'DON’T GIVE UP!',
    'ALMOST ALMOST',
  ],
  resultMessage: 'Well done!',
  resultAction: 'Back to About me',
  firstRepHint: 'tap repeatedly',
};
export const totalReps = () => gymGameConfig.repDifficulties.length;
export const getRepDifficulty = (state: { repIndex: number }) =>
  gymGameConfig.repDifficulties[state.repIndex];

export function getLiftImpulse(
  state: {
    repIndex: number;
    effort: number;
    lastInputAt: number;
    tapIntervalMs: number | null;
  },
  now: number,
) {
  const base = getRepDifficulty(state).impulsePerInput;
  if (state.repIndex !== totalReps() - 1) return base;
  const assist = gymGameConfig.finalRepAssist;
  const cadence = gymGameConfig.finalRepCadence;
  const speed = Math.max(
    0,
    Math.min(
      1,
      (cadence.slowIntervalMs -
        (state.tapIntervalMs ?? cadence.slowIntervalMs)) /
        (cadence.slowIntervalMs - cadence.fastIntervalMs),
    ),
  );
  const resistance = Math.max(
    0,
    Math.min(
      1,
      (state.effort - cadence.startsAt) / (cadence.fullAt - cadence.startsAt),
    ),
  );
  const hardGain =
    cadence.slowGainPerSecond +
    (cadence.fastGainPerSecond - cadence.slowGainPerSecond) * speed;
  const gainPerSecond =
    assist.maxGainPerSecond + (hardGain - assist.maxGainPerSecond) * resistance;
  const progress = Math.max(
    0,
    Math.min(
      1,
      (state.effort - assist.startsAt) / (assist.fullAt - assist.startsAt),
    ),
  );
  const impulse = base + assist.extraImpulse * progress;
  const elapsed = Math.max(0, now - state.lastInputAt) / 1000;
  const gainLimit =
    (gainPerSecond + assist.extraGainPerSecond * progress) * elapsed;
  return Math.min(impulse, gainLimit);
}
