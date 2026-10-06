import type {
  GymLeaderboardAdapter,
  GymLeaderboardEntry,
  GymLeaderboardSnapshot,
} from './types.js';

interface StoredEntry {
  playerId: string;
  durationMs: number;
}

interface StoredLeaderboard {
  playerId: string;
  entries: StoredEntry[];
}

export function createLocalLeaderboard({
  storageKey = 'gym-minigame:leaderboard:cadence-v1',
  sampleTimes = [],
}: {
  storageKey?: string;
  sampleTimes?: readonly number[];
} = {}): GymLeaderboardAdapter & { reset: () => void } {
  let memory: StoredLeaderboard | null = null;
  let persisted = true;

  const fresh = (): StoredLeaderboard => ({
    playerId: crypto.randomUUID(),
    entries: sampleTimes.map((durationMs, index) => ({
      playerId: `sample-${index + 1}`,
      durationMs,
    })),
  });

  function save(data: StoredLeaderboard) {
    memory = data;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      persisted = true;
    } catch {
      persisted = false;
    }
  }

  function read(): StoredLeaderboard {
    if (!persisted && memory) return memory;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredLeaderboard>;
        if (
          typeof parsed.playerId === 'string' &&
          parsed.playerId &&
          Array.isArray(parsed.entries)
        ) {
          const best = new Map<string, StoredEntry>();
          for (const entry of parsed.entries) {
            if (
              !entry ||
              typeof entry.playerId !== 'string' ||
              !entry.playerId ||
              !Number.isSafeInteger(entry.durationMs) ||
              entry.durationMs <= 0
            )
              continue;
            const previous = best.get(entry.playerId);
            if (!previous || entry.durationMs < previous.durationMs)
              best.set(entry.playerId, entry);
          }
          memory = { playerId: parsed.playerId, entries: [...best.values()] };
          return memory;
        }
      }
    } catch {
      if (memory) return memory;
    }
    const data = fresh();
    save(data);
    return data;
  }

  function snapshot(
    data: StoredLeaderboard,
    isPersonalBest = false,
  ): GymLeaderboardSnapshot {
    const sorted = [...data.entries].sort(
      (a, b) =>
        a.durationMs - b.durationMs || a.playerId.localeCompare(b.playerId),
    );
    const ranked: GymLeaderboardEntry[] = sorted.map((entry) => ({
      ...entry,
      rank:
        sorted.findIndex((other) => other.durationMs === entry.durationMs) + 1,
      isCurrentPlayer: entry.playerId === data.playerId,
    }));
    return {
      top: ranked.slice(0, 3),
      currentPlayer: ranked.find((entry) => entry.isCurrentPlayer) ?? null,
      totalPlayers: ranked.length,
      isPersonalBest,
      scope: 'local',
      persisted,
      hasSampleEntries: ranked.some((entry) =>
        entry.playerId.startsWith('sample-'),
      ),
    };
  }

  return {
    async load() {
      return snapshot(read());
    },
    async submit({ durationMs }) {
      const time = Math.round(durationMs);
      if (!Number.isSafeInteger(time) || time <= 0)
        throw new Error('Invalid workout time');
      const data = read();
      const previous = data.entries.find(
        (entry) => entry.playerId === data.playerId,
      );
      const isPersonalBest = !previous || time < previous.durationMs;
      if (isPersonalBest) {
        data.entries = data.entries.filter(
          (entry) => entry.playerId !== data.playerId,
        );
        data.entries.push({ playerId: data.playerId, durationMs: time });
        save(data);
      }
      return snapshot(data, isPersonalBest);
    },
    reset() {
      memory = null;
      try {
        localStorage.removeItem(storageKey);
      } catch {
        persisted = false;
      }
      save(fresh());
    },
  };
}
