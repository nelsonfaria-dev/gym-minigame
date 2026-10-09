import { totalReps } from '../game/gymGameConfig';
import type { GymState } from '../game/gymGameTypes';

export function GymHUD({ state }: { state: GymState }) {
  const currentRep = state.repIndex + 1;
  return (
    <div
      className="gym-experience__hud"
      aria-label={`Rep ${currentRep} of ${totalReps()}`}
    >
      <strong data-current-rep>{currentRep}</strong>
      <span className="gym-experience__muted">/{totalReps()} reps</span>
    </div>
  );
}
