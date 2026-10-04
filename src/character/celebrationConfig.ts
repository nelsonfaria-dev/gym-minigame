import spriteAsset from '../assets/ending/celebration-poses.png';
import glassesAsset from '../assets/ending/glasses-placing-poses.png';
import { faceAssets } from './characterFrameConfig';
import { assetUrl } from '../utils/assetUrl';

const sprite = assetUrl(spriteAsset);
const glassesSprite = assetUrl(glassesAsset);
export const celebrationSprite = sprite;
export const glassesPlacingSprite = glassesSprite;
export const celebrationTimings = {
  setDown: 180,
  glassesLift: 1000,
  glassesRaise: 1240,
  glasses: 1480,
  flex: 2250,
};
export type CelebrationPose =
  'rest' | 'set-down' | 'glasses-lift' | 'glasses-raise' | 'glasses' | 'flex';
const eyeCenter = { x: (352 + 674) / 2, y: (703 + 691) / 2 };
const head = faceAssets.neutral;
export const sunglassesPlacement = {
  x:
    head.placement.x + (eyeCenter.x * head.placement.width) / head.source.width,
  y:
    head.placement.y +
    (eyeCenter.y * head.placement.height) / head.source.height,
  scaleX: 1.12,
};

function placingPose(cell: number, sourceJawX: number, glassesOffsetY: number) {
  return {
    src: glassesSprite,
    crop: { x: cell * 400, width: 400 },
    imageX: 200 - (sourceJawX * 1200) / 1536,
    imageY: 44,
    jawX: 200,
    jawY: 155.9,
    scale: 1,
    glassesOffsetY,
  };
}
export const celebrationPoses = {
  'set-down': {
    src: sprite,
    glassesOffsetY: 0,
    crop: { x: 0, width: 400 },
    imageX: -4.7,
    imageY: 44,
    jawX: 200,
    jawY: 323.1,
    scale: 1.065,
  },
  'glasses-lift': placingPose(0, 266, 24),
  'glasses-raise': placingPose(1, 769, 11),
  glasses: placingPose(2, 1277.5, 0),
  flex: {
    src: sprite,
    glassesOffsetY: 0,
    crop: { x: 781.25, width: 418.75 },
    imageX: -788.67,
    imageY: 44,
    jawX: 200,
    jawY: 155.9,
    scale: 1,
  },
} as const;
