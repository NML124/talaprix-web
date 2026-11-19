export interface Option {
  readonly id: string;
  readonly name: string;
  readonly image?: string;
}

export function offerPayload(
  existingId: string | undefined,
  shopId: string,
  product: Option | undefined,
  price: number,
  source: string,
  currency: string,
): { body?: Record<string, unknown>; error?: string } {
  if (
    (!existingId && (!shopId || !product)) ||
    !currency ||
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
      ? {
          resource: 'offers',
          id: existingId,
          action: 'update',
          price,
          source,
          devise_id: currency,
        }
      : {
          shop_id: shopId,
          product_id: product!.id,
          name: product!.name,
          price,
          source,
          devise_id: currency,
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
          image:
            typeof row['product_picture'] === 'string' &&
            /^https:\/\//i.test(row['product_picture'])
              ? row['product_picture']
              : undefined,
        }))
        .filter((row) => row.id && row.name)
    : [];
}
export function labels(rows: readonly Option[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}
export function message(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  if (/json|unexpected token|minus sign|formdata/i.test(error.message))
    return 'Le serveur n’a pas pu lire le formulaire. Vérifiez les images puis réessayez.';
  return error.message || fallback;
}
