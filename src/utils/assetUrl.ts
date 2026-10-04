export function assetUrl(source: string | { src: string }): string {
  return typeof source === 'string' ? source : source.src;
}
