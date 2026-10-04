import { characterFrameConfig, faceAssets } from './characterFrameConfig';
import { celebrationSprite, glassesPlacingSprite } from './celebrationConfig';

export type CharacterAssetStatus = 'loading' | 'ready' | 'error';
let status: CharacterAssetStatus = 'loading';
let pending: Promise<void> | undefined;
let decoded: HTMLImageElement[] = [];
export const getCharacterAssetStatus = () => status;

export function preloadCharacterAssets(): Promise<void> {
  if (pending) return pending;
  const sources = [
    ...new Set([
      ...characterFrameConfig.map((frame) => frame.src),
      ...Object.values(faceAssets).map((face) => face.src),
      celebrationSprite,
      glassesPlacingSprite,
    ]),
  ];
  status = 'loading';
  pending = Promise.all(
    sources.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = async () => {
            try {
              if (image.decode) await image.decode();
              resolve(image);
            } catch (error) {
              reject(error);
            }
          };
          image.onerror = () =>
            reject(new Error(`Character asset could not load: ${src}`));
          image.src = src;
        }),
    ),
  )
    .then((images) => {
      decoded = images;
      status = 'ready';
    })
    .catch((error) => {
      decoded = [];
      status = 'error';
      pending = undefined;
      throw error;
    });
  return pending;
}

export const getPreloadedCharacterCount = () => decoded.length;
