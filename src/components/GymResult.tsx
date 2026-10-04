import { useEffect, useState, type RefObject } from 'react';
import { gymCopy, gymGameConfig } from '../game/gymGameConfig';

export function GymResult({
  onReturn,
  buttonRef,
}: {
  onReturn: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setReady(true),
      gymGameConfig.resultActionDelayMs,
    );
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="gym-experience__result">
      <h2 className="gym-experience__shout-text">{gymCopy.resultTitle}</h2>
      <p className="gym-experience__shout-text gym-experience__result-message">
        {gymCopy.resultMessage}
      </p>
      <button
        ref={buttonRef}
        type="button"
        className="gym-experience__return"
        aria-disabled={!ready}
        onClick={() => {
          if (ready) onReturn();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (ready && !event.repeat) onReturn();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === ' ') event.preventDefault();
        }}
      >
        {gymCopy.resultAction} <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
