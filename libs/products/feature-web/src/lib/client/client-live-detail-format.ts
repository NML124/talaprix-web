/** Pure helpers for the live product page (formatting and contact links). */

export type DisplayCurrency = 'CDF' | 'USD';

export interface Priced {
  readonly price: number;
  readonly currency: DisplayCurrency;
  readonly normalizedPriceCdf: number;
}

/**
 * Converts an offre price to the visitor's currency. Without a USD/CDF rate a
 * USD view cannot be computed from CDF, so the offre keeps its own currency.
 */
export function displayPrice(
  item: Priced,
  selected: DisplayCurrency,
  usdToCdf: number | null,
): string {
  if (selected === item.currency) return formatMoney(item.price, selected);
  if (selected === 'CDF') return formatMoney(item.normalizedPriceCdf, 'CDF');
  if (usdToCdf && usdToCdf > 0)
    return formatMoney(item.normalizedPriceCdf / usdToCdf, 'USD');
  return formatMoney(item.price, item.currency);
}

export function formatMoney(value: number, currency: DisplayCurrency): string {
  const amount = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: currency === 'CDF' ? 0 : 2,
  }).format(value);
  return `${amount} ${currencyLabel(currency)}`;
}

export function currencyLabel(currency: DisplayCurrency): string {
  return currency === 'CDF' ? 'FC' : 'USD';
}

export function conditionLabel(condition: string | null): string | null {
  switch (condition) {
    case 'new':
      return 'Neuf';
    case 'used':
      return 'Occasion';
    case 'refurbished':
      return 'Reconditionné';
    default:
      return 'État non précisé';
  }
}

export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Same rules as the mobile app (`whatsapp_contact.dart`). */
export function whatsappPhone(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  let digits = raw.replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^0[89][0-9]{8}$/.test(digits)) digits = `243${digits.slice(1)}`;
  return /^[1-9][0-9]{7,14}$/.test(digits) ? digits : null;
}

export function whatsappUrl(
  phone: string,
  shopName: string,
  productName: string,
  link: string,
): string {
  const message = `Bonjour ${shopName}, je suis intéressé(e) par ${productName}.\n\nVoir le produit sur TalaPrix : ${link}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function directionsUrl(
  lat: number | null,
  lon: number | null,
  address: string | null,
): string | null {
  const destination =
    lat !== null && lon !== null ? `${lat},${lon}` : (address ?? null);
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    : null;
}

export function productLink(referenceId: string): string {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://talaprix.com';
  return `${origin}/produit/${encodeURIComponent(referenceId)}`;
}

export function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export interface SourceLink {
  readonly url: string;
  readonly label: string;
}

/**
 * Offer notes often end with "Source: https://…" (a long social-media URL).
 * Splits them into readable text and named links shown as buttons.
 */
export function splitSources(text: string | null): {
  readonly text: string;
  readonly links: readonly SourceLink[];
} {
  if (!text) return { text: '', links: [] };
  const links: SourceLink[] = [];
  const clean = text
    .replace(
      /(?:source\s*:\s*)?(https?:\/\/[^\s)]+)/gi,
      (_match, url: string) => {
        links.push({ url, label: sourceLabel(url) });
        return '';
      },
    )
    .replace(/\s+([.,;])/g, '$1')
    .replace(/[\s.:;,-]+$/, '')
    .trim();
  return { text: clean ? `${clean}.`.replace(/\.\.$/, '.') : '', links };
}

function sourceLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^(www|m)\./, '');
    const known: Record<string, string> = {
      'facebook.com': 'Facebook',
      'fb.com': 'Facebook',
      'instagram.com': 'Instagram',
      'tiktok.com': 'TikTok',
      'wa.me': 'WhatsApp',
      'x.com': 'X',
      'twitter.com': 'X',
    };
    return known[host] ?? host;
  } catch {
    return 'Lien';
  }
}
