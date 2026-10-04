import { clamp } from '../utils/interpolation';
import { characterFrameConfig } from './characterFrameConfig';

export function getBodyFrameIndex(curlProgress: number) {
  return Math.round(clamp(curlProgress) * (characterFrameConfig.length - 1));
}
