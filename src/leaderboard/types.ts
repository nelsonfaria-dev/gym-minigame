export interface GymWorkoutResult {
  durationMs: number;
}

export interface GymLeaderboardEntry {
  playerId: string;
  rank: number;
  durationMs: number;
  isCurrentPlayer: boolean;
}

export interface GymLeaderboardSnapshot {
  top: GymLeaderboardEntry[];
  currentPlayer: GymLeaderboardEntry | null;
  totalPlayers: number;
  isPersonalBest: boolean;
  scope: 'local' | 'global';
  persisted: boolean;
  hasSampleEntries?: boolean;
}

export interface GymLeaderboardAdapter {
  load: () => Promise<GymLeaderboardSnapshot>;
  submit: (result: GymWorkoutResult) => Promise<GymLeaderboardSnapshot>;
}
