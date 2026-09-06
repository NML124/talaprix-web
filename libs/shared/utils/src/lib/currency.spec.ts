import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats a value using the requested locale and currency', () => {
    expect(formatCurrency(1250, 'XOF', 'fr-FR')).toContain('1\u202f250');
  });
});
