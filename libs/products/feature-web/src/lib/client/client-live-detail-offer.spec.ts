import { TestBed } from '@angular/core/testing';
import type {
  CatalogOffer,
  OfferInsight,
} from '@talaprix/products/data-access';
import { PreviewPreferences } from '@talaprix/shared/data-access';
import { ClientLiveDetailOffer } from './client-live-detail-offer';

describe('offer price history visibility', () => {
  const offer: CatalogOffer = {
    id: 'offer',
    referenceId: 'reference',
    productId: 'product',
    shopId: 'shop',
    shopName: 'Boutique',
    shopImage: null,
    shopAddress: null,
    shopLat: null,
    shopLon: null,
    name: 'Produit',
    variantLabel: null,
    image: null,
    price: 100,
    currency: 'USD',
    normalizedPriceCdf: 226500,
    condition: null,
    deviseId: null,
    description: null,
    sourceUrl: 'https://example.com/produit',
    images: [],
    distanceKm: null,
  };
  const insight: OfferInsight = {
    offerId: 'offer',
    phone: null,
    minHistoricalPrice: 100,
    maxHistoricalPrice: 100,
    history: [],
    priceComment: 'Prix relevé chez le vendeur.',
    promo: null,
    images: [],
    description: null,
  };

  function render(value: OfferInsight | null) {
    TestBed.configureTestingModule({
      imports: [ClientLiveDetailOffer],
      providers: [
        {
          provide: PreviewPreferences,
          useValue: {
            liveMoney: (price: number) => `${price} USD`,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(ClientLiveDetailOffer);
    fixture.componentRef.setInput('offer', offer);
    fixture.componentRef.setInput('price', '100 USD');
    fixture.componentRef.setInput('productName', 'Produit');
    fixture.componentRef.setInput('insight', value);
    fixture.componentInstance.expanded.set(true);
    fixture.detectChanges();
    return fixture;
  }

  it('does not display a history heading or empty message before insights load', () => {
    const fixture = render(null);
    expect(
      fixture.nativeElement.querySelector('[aria-label="Historique des prix"]'),
    ).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Aucun historique');
  });

  it('hides an empty history even when summary prices are present, preserving notes and source', () => {
    const fixture = render(insight);
    expect(
      fixture.nativeElement.querySelector('[aria-label="Historique des prix"]'),
    ).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Prix relevé chez le vendeur.',
    );
    expect(
      fixture.nativeElement.querySelector(
        'a[href="https://example.com/produit"]',
      ),
    ).not.toBeNull();
  });

  it('displays the historical prices when recorded points exist', () => {
    const fixture = render({
      ...insight,
      minHistoricalPrice: 80,
      history: [
        { date: '2026-11-22', price: 80 },
        { date: '2026-11-23', price: 100 },
      ],
    });
    expect(
      fixture.nativeElement.querySelector('[aria-label="Historique des prix"]'),
    ).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('80 USD');
    expect(
      fixture.nativeElement.querySelector(
        'svg[aria-label="Graphique des prix au fil du temps"] path[d]',
      ),
    ).not.toBeNull();
    const point = fixture.nativeElement.querySelector('svg g[role="button"]');
    point.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Prix historique');
    expect(fixture.nativeElement.textContent).toContain('22 nov. 2026');
  });
});
