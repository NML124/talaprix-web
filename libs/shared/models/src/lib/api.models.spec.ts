import type { ApiResult } from './api.models';

describe('ApiResult', () => {
  it('preserves a typed successful payload', () => {
    const result: ApiResult<number> = { ok: true, data: 42 };
    expect(result.ok && result.data).toBe(42);
  });
});
