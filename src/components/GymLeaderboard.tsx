import { useEffect, useRef, useState } from 'react';
import type {
  GymLeaderboardAdapter,
  GymLeaderboardEntry,
  GymLeaderboardSnapshot,
} from '../leaderboard/types.js';

function formatTime(durationMs: number) {
  const hundredths = Math.floor(durationMs / 10);
  const minutes = Math.floor(hundredths / 6000);
  const seconds = Math.floor(hundredths / 100) % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths % 100).padStart(2, '0')}`;
}

function LeaderboardRow({ entry }: { entry: GymLeaderboardEntry }) {
  return (
    <tr
      className={entry.isCurrentPlayer ? 'gym-leaderboard__you' : undefined}
      data-current-player={entry.isCurrentPlayer}
    >
      <td>
        <span className="gym-leaderboard__rank">#{entry.rank}</span>
        {entry.isCurrentPlayer && (
          <span className="gym-leaderboard__you-label">YOU</span>
        )}
      </td>
      <td>{formatTime(entry.durationMs)}</td>
    </tr>
  );
}

export function GymLeaderboard({
  adapter,
  durationMs,
}: {
  adapter: GymLeaderboardAdapter;
  durationMs: number | null;
}) {
  const [snapshot, setSnapshot] = useState<GymLeaderboardSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const request = useRef<{
    adapter: GymLeaderboardAdapter;
    durationMs: number | null;
    retry: number;
    promise: Promise<GymLeaderboardSnapshot>;
  } | null>(null);

  useEffect(() => {
    let active = true;
    setSnapshot(null);
    setFailed(false);
    if (
      !request.current ||
      request.current.adapter !== adapter ||
      request.current.durationMs !== durationMs ||
      request.current.retry !== retry
    ) {
      request.current = {
        adapter,
        durationMs,
        retry,
        promise: Promise.resolve().then(() =>
          durationMs === null ? adapter.load() : adapter.submit({ durationMs }),
        ),
      };
    }
    request.current.promise.then(
      (result) => {
        if (active) setSnapshot(result);
      },
      () => {
        if (active) setFailed(true);
      },
    );
    return () => {
      active = false;
    };
  }, [adapter, durationMs, retry]);

  const ownOutsideTop =
    snapshot?.currentPlayer &&
    !snapshot.top.some((entry) => entry.isCurrentPlayer);
  return (
    <aside className="gym-leaderboard" aria-label="Workout leaderboard">
      {snapshot ? (
        <>
          <table aria-label="Workout times">
            <thead>
              <tr>
                <th scope="col">POS.</th>
                <th scope="col">BEST TIME</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.top.map((entry) => (
                <LeaderboardRow key={entry.playerId} entry={entry} />
              ))}
              {ownOutsideTop && (
                <>
                  {snapshot.currentPlayer!.rank > 4 && (
                    <tr className="gym-leaderboard__gap" aria-hidden="true">
                      <td colSpan={2}>···</td>
                    </tr>
                  )}
                  <LeaderboardRow entry={snapshot.currentPlayer!} />
                </>
              )}
            </tbody>
          </table>
        </>
      ) : (
        <p className="gym-leaderboard__status" role="status">
          {failed ? (
            <>
              Ranking unavailable.{' '}
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
              >
                Try again
              </button>
            </>
          ) : (
            'Loading times…'
          )}
        </p>
      )}
    </aside>
  );
}
