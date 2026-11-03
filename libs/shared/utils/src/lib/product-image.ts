/** Use Storage's public image transformer while keeping the original in the catalogue. */
export function productImageUrl(
  source: string | null,
  width: number,
): string | null {
  if (!source) return null;
  try {
    const url = new URL(source);
    const prefix = '/storage/v1/object/public/product_picture/';
    if (
      url.protocol !== 'https:' ||
      !url.pathname.startsWith(prefix) ||
      !/\.(?:png|jpe?g|webp)$/i.test(url.pathname) ||
      url.search ||
      !Number.isInteger(width) ||
      width < 1 ||
      width > 2500
    )
      return source;
    url.pathname = url.pathname.replace(
      prefix,
      '/storage/v1/render/image/public/product_picture/',
    );
    url.searchParams.set('width', String(width));
    url.searchParams.set('quality', '75');
    url.searchParams.set('resize', 'contain');
    return url.toString();
  } catch {
    return source;
  }
}

export function productImageSrcset(
  source: string | null,
  widths: readonly number[],
): string | null {
  if (!source) return null;
  const candidates = widths.map((width) => productImageUrl(source, width));
  if (
    candidates.some((candidate) => candidate === source || candidate === null)
  )
    return null;
  return candidates
    .map((candidate, index) => `${candidate} ${widths[index]}w`)
    .join(', ');
}
