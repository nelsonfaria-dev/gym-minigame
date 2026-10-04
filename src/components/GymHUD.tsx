import { totalReps } from '../game/gymGameConfig';
import type { GymState } from '../game/gymGameTypes';

export function GymHUD({ state }: { state: GymState }) {
  return (
    <div
      className="gym-experience__hud"
      aria-label={`${state.completedReps} of ${totalReps()} reps complete`}
    >
      <strong data-completed-reps>{state.completedReps}</strong>
      <span className="gym-experience__muted">/{totalReps()} reps</span>
    </div>
  );
}
