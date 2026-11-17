export interface Option {
  readonly id: string;
  readonly name: string;
}

export function offerPayload(
  existingId: string | undefined,
  shopId: string,
  product: Option | undefined,
  price: number,
  source: string,
): { body?: Record<string, unknown>; error?: string } {
  if (
    (!existingId && (!shopId || !product)) ||
    !Number.isFinite(price) ||
    price <= 0
  )
    return { error: 'Choisissez une boutique, un produit et un prix valide.' };
  if (source !== 'TalaPrix' && !/^https?:\/\/[^\s]+$/i.test(source))
    return {
      error: 'Indiquez TalaPrix ou l’URL de la publication du vendeur.',
    };
  return {
    body: existingId
      ? { resource: 'offers', id: existingId, action: 'update', price, source }
      : {
          shop_id: shopId,
          product_id: product!.id,
          name: product!.name,
          price,
          source,
        },
  };
}

export function createTitle(resource: string, editing: boolean): string {
  const nouns: Record<string, string> = {
    products: 'un produit',
    categories: 'une catégorie',
    shops: 'une boutique',
    offers: 'une offre',
    advertisements: 'une publicité',
    users: 'un utilisateur',
  };
  return `${editing ? 'Modifier' : 'Ajouter'} ${nouns[resource] ?? 'un élément'}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function data(value: unknown): unknown {
  return isRecord(value) ? value['data'] : null;
}
export function options(value: unknown, idKey: string): Option[] {
  return Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((row) => ({
          id: String(row[idKey] ?? ''),
          name: String(row['name'] ?? ''),
        }))
        .filter((row) => row.id && row.name)
    : [];
}
export function labels(rows: readonly Option[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}
export function message(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
