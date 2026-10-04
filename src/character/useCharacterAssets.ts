import { useEffect, useState } from 'react';
import {
  getCharacterAssetStatus,
  preloadCharacterAssets,
} from './preloadCharacterAssets';

export function useCharacterAssets() {
  const [status, setStatus] = useState(getCharacterAssetStatus);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    preloadCharacterAssets().then(
      () => {
        if (active) setStatus('ready');
      },
      () => {
        if (active) setStatus('error');
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);
  const retry = () => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  };
  return { status, retry };
}
