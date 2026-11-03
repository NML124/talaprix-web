import { productImageSrcset, productImageUrl } from './product-image';

const source =
  'https://api-main.talaprix.com/storage/v1/object/public/product_picture/catalogue-20261030/example.png';

describe('public product image delivery', () => {
  it('requests a contained, responsive Storage image without changing its source', () => {
    expect(productImageUrl(source, 320)).toBe(
      'https://api-main.talaprix.com/storage/v1/render/image/public/product_picture/catalogue-20261030/example.png?width=320&quality=75&resize=contain',
    );
    expect(productImageSrcset(source, [320, 640])).toContain(' 640w');
    expect(source).toContain('/object/public/');
  });

  it('preserves non-public, signed, and unrelated images', () => {
    for (const url of [
      'https://example.com/photo.png',
      'https://api-main.talaprix.com/storage/v1/object/sign/product_picture/private.png',
      `${source}?token=abc`,
    ]) {
      expect(productImageUrl(url, 320)).toBe(url);
      expect(productImageSrcset(url, [320, 640])).toBeNull();
    }
  });
});
