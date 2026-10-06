export type GymPhase =
  | 'closed'
  | 'entering'
  | 'ready'
  | 'lifting'
  | 'top'
  | 'lowering'
  | 'finished'
  | 'exiting';
export type Expression = 'neutral' | 'strain' | 'exhausted';

export interface GymState {
  phase: GymPhase;
  repIndex: number;
  completedReps: number;
  effort: number;
  phaseStartedAt: number;
  lastInputAt: number;
  tapIntervalMs: number | null;
  workoutStartedAt: number | null;
  workoutDurationMs: number | null;
  lastTickAt: number;
  reducedMotion: boolean;
}
export type GymAction =
  | { type: 'open'; now: number; reducedMotion: boolean }
  | { type: 'tick' | 'lift' | 'close'; now: number }
  | { type: 'motionPreference'; reducedMotion: boolean };

export interface GymGameView {
  targetCurl: number;
  walkProgress: number;
  fatigue: number;
  expression: Expression;
  cta: string;
  message: string;
}
