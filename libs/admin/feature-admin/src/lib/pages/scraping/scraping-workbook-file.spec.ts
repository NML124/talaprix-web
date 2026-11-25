import { describe, expect, it } from 'vitest';
import { workbookFileError } from './scraping-workbook-file';

describe('Seller workbook selection', () => {
  it('accepts the documented maximum and an uppercase Excel extension', () => {
    expect(
      workbookFileError({ name: 'VENDEURS.XLSX', size: 8 * 1024 * 1024 }),
    ).toBe('');
  });
  it.each([
    { name: 'vendeurs.xlsx', size: 0 },
    { name: 'vendeurs.xlsx', size: 8 * 1024 * 1024 + 1 },
    { name: 'vendeurs.csv', size: 42 },
    { name: 'vendeurs.xlsx.exe', size: 42 },
  ])(
    'rejects unusable selection with French feedback: $name ($size bytes)',
    (file) => {
      expect(workbookFileError(file)).toMatch(/fichier|Format/);
    },
  );
});
