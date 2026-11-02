import { splitSources, whatsappPhone } from './client-live-detail-format';

describe('splitSources', () => {
  it('turns a trailing "Source: url" into a named link', () => {
    const result = splitSources(
      'Prix publié le 01/10/2026. Disponibilité à confirmer auprès de la boutique. Source: https://www.facebook.com/Rodrygo00/posts/pfbid026M',
    );

    expect(result.text).toBe(
      'Prix publié le 01/10/2026. Disponibilité à confirmer auprès de la boutique.',
    );
    expect(result.links).toEqual([
      {
        url: 'https://www.facebook.com/Rodrygo00/posts/pfbid026M',
        label: 'Facebook',
      },
    ]);
  });

  it('keeps plain text untouched and handles empty notes', () => {
    expect(splitSources('Neuf, sous blister.')).toEqual({
      text: 'Neuf, sous blister.',
      links: [],
    });
    expect(splitSources(null)).toEqual({ text: '', links: [] });
  });
});

describe('whatsappPhone', () => {
  it('normalises Congolese numbers like the mobile app', () => {
    expect(whatsappPhone('0812 345 678')).toBe('243812345678');
    expect(whatsappPhone('00243 81 234 5678')).toBe('243812345678');
    expect(whatsappPhone('123')).toBeNull();
  });
});
