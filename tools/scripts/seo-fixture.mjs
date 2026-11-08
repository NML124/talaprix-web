// Only the isolated SSR regression child loads this fixture. Production never imports it.
export const id = '11111111-1111-4111-8111-111111111111';
export const category = '22222222-2222-4222-8222-222222222222';
export const missing = '33333333-3333-4333-8333-333333333333';
export const unavailable = '44444444-4444-4444-8444-444444444444';
const reference = {
  id,
  product_id: id,
  name: 'Produit test SEO',
  product_name: 'Produit test SEO',
  min_price: 100,
  normalized_price: 280000,
  devise_name: 'USD',
  shops_count: 3,
  category_id: category,
  category_name: 'Audio',
  brand_name: 'Marque test',
};
const original = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (!url.pathname.startsWith('/functions/v1/')) {
    if (['localhost', '127.0.0.1'].includes(url.hostname))
      return original(input, options);
    throw new Error('SEO fixture blocked external request');
  }
  if ((options?.method ?? 'GET') !== 'GET')
    throw new Error('SEO fixture blocked write');
  // Delayed data proves the HTML waits for ordinary fetch promises.
  await new Promise((resolve) => setTimeout(resolve, 100));
  const name = url.pathname.split('/').pop();
  if (name === 'get-categories')
    return Response.json([
      { category_id: category, name: 'Audio', is_client_visible: true },
    ]);
  if (name === 'get-shops-list')
    return Response.json([
      { shop_id: id, name: 'Boutique test', address: 'Kinshasa' },
    ]);
  if (name === 'get-devises')
    return Response.json([{ devise_name: 'USD', taux: 2800 }]);
  if (name === 'get-offer-references') {
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '20');
    if (page === 500)
      return Response.json({ error: 'Temporary failure' }, { status: 503 });
    if (page === 499)
      return Response.json({ data: [], pagination: { totalPages: 1000000 } });
    const total = 201;
    const pages = Math.ceil(total / limit);
    return Response.json({
      data: page <= pages ? [reference] : [],
      page,
      pagination: { total, totalPages: pages },
      exchange_rates: { usd_cdf: 2800 },
    });
  }
  if (name === 'get-offer-reference-offers') {
    const selected = url.searchParams.get('offer_reference_id');
    if (selected === missing)
      return Response.json({ error: 'Introuvable' }, { status: 404 });
    if (selected === unavailable)
      return Response.json({ error: 'Service indisponible' }, { status: 503 });
    return Response.json({
      success: true,
      offer_reference: reference,
      best_offer_id: 'usd-a',
      offers: [
        ['usd-a', 100, 'USD'],
        ['usd-b', 120, 'USD'],
        ['cdf', 300000, 'CDF'],
      ].map(([offer_id, price, devise_name]) => ({
        offer_id,
        price,
        devise_name,
        normalized_price: devise_name === 'USD' ? price * 2800 : price,
        offer_reference_id: id,
        product_id: id,
        shop_id: offer_id,
        shop_name: `Boutique ${offer_id}`,
      })),
    });
  }
  return Response.json([]);
};
