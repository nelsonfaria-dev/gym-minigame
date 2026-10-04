import body01 from '../assets/body/halteres_01.png';
import body02 from '../assets/body/halteres_02.png';
import body03 from '../assets/body/halteres_03.png';
import body04 from '../assets/body/halteres_04.png';
import body05 from '../assets/body/halteres_05.png';
import body06 from '../assets/body/halteres_06.png';
import neutral from '../assets/faces/cara_01-head.png';
import strain from '../assets/faces/cara_03-head.png';
import exhausted from '../assets/faces/cara_05-head.png';
import { assetUrl } from '../utils/assetUrl';

export interface FaceAlignment {
  x: number;
  y: number;
  scale: number;
  rotate: number;
}
export interface CharacterBodyFrame {
  src: string;
  label: string;
  face: FaceAlignment;
}
export const characterCanvas = {
  width: 400,
  height: 800,
  body: { x: 0, y: 128, width: 400, height: 672 },
};
export const characterFrameConfig: readonly CharacterBodyFrame[] = [
  {
    src: assetUrl(body01),
    label: 'halteres_01.png',
    face: { x: 200.881, y: 161, scale: 1.0263, rotate: 1.364 },
  },
  {
    src: assetUrl(body02),
    label: 'halteres_02.png',
    face: { x: 199.5, y: 161, scale: 1.0088, rotate: 0 },
  },
  {
    src: assetUrl(body03),
    label: 'halteres_03.png',
    face: { x: 198.875, y: 162, scale: 1, rotate: 1.432 },
  },
  {
    src: assetUrl(body04),
    label: 'halteres_04.png',
    face: { x: 200, y: 161, scale: 1, rotate: 0 },
  },
  {
    src: assetUrl(body05),
    label: 'halteres_05.png',
    face: { x: 199.5, y: 161, scale: 1.0088, rotate: 0 },
  },
  {
    src: assetUrl(body06),
    label: 'halteres_06.png',
    face: { x: 198.81, y: 161, scale: 1.0439, rotate: -0.682 },
  },
];
function registerHead(
  src: string | { src: string },
  label: string,
  filename: string,
  jaw: { x: number; y: number },
  visibleTop: number,
) {
  const source = { width: 1036, height: 1518, jaw };
  const scale = 134 / (jaw.y + 1 - visibleTop);
  return {
    src: assetUrl(src),
    label,
    filename,
    source,
    placement: {
      x: -jaw.x * scale,
      y: -jaw.y * scale,
      width: source.width * scale,
      height: source.height * scale,
    },
  };
}
export const faceAssets = {
  neutral: registerHead(
    neutral,
    'Neutral',
    'cara_01-head.png',
    { x: 512.5, y: 1271 },
    63,
  ),
  strain: registerHead(
    strain,
    'Effort',
    'cara_03-head.png',
    { x: 519.5, y: 1302 },
    62,
  ),
  exhausted: registerHead(
    exhausted,
    'Max effort',
    'cara_05-head.png',
    { x: 537, y: 1423 },
    50,
  ),
};
