import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideArrowRight,
  LucideBadgePercent,
  LucideChevronDown,
  LucideChevronRight,
  LucideCircleHelp,
  LucideHeart,
  LucideMenu,
  LucideQrCode,
  LucideSearch,
  LucideShieldCheck,
  LucideShoppingCart,
  LucideStar,
  LucideUserRound,
} from '@lucide/angular';

interface HomeCategory {
  readonly name: string;
  readonly description: string;
  readonly image: string;
}

interface HomeProduct {
  readonly name: string;
  readonly merchant: string;
  readonly price: string;
  readonly oldPrice?: string;
  readonly discount?: string;
  readonly image: string;
  readonly rating: number;
}

@Component({
  selector: 'lib-products-feature-web',
  imports: [
    LucideArrowRight,
    LucideBadgePercent,
    LucideChevronDown,
    LucideChevronRight,
    LucideCircleHelp,
    LucideHeart,
    LucideMenu,
    LucideQrCode,
    LucideSearch,
    LucideShieldCheck,
    LucideShoppingCart,
    LucideStar,
    LucideUserRound,
  ],
  templateUrl: './products-feature-web.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsFeatureWeb {
  protected readonly categories: readonly HomeCategory[] = [
    {
      name: 'Téléphones & tablettes',
      description: 'Les essentiels connectés',
      image: '/assets/images/logo_app.png',
    },
    {
      name: 'Maison & électroménager',
      description: 'Équipez votre quotidien',
      image: '/assets/images/logo_app.png',
    },
    {
      name: 'Informatique',
      description: 'Travaillez plus efficacement',
      image: '/assets/images/logo_app.png',
    },
    {
      name: 'Mode & beauté',
      description: 'Trouvez votre style',
      image: '/assets/images/logo_app.png',
    },
  ];

  protected readonly products: readonly HomeProduct[] = [
    {
      name: 'Apple iPhone 15 128 Go',
      merchant: 'Apple Store',
      price: '1 049 000 FC',
      oldPrice: '1 199 000 FC',
      discount: '-13%',
      image: '/assets/images/panier.png',
      rating: 4.8,
    },
    {
      name: 'Casque Sony WH-1000XM5',
      merchant: 'Tech Market',
      price: '289 000 FC',
      oldPrice: '335 000 FC',
      discount: '-14%',
      image: '/assets/images/panier.png',
      rating: 4.7,
    },
    {
      name: 'Machine à café automatique',
      merchant: 'Maison Plus',
      price: '429 900 FC',
      image: '/assets/images/panier.png',
      rating: 4.5,
    },
    {
      name: 'Nike Air Max 270',
      merchant: 'Style Shop',
      price: '159 000 FC',
      oldPrice: '189 000 FC',
      discount: '-16%',
      image: '/assets/images/panier.png',
      rating: 4.6,
    },
  ];
}
