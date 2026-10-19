import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tp-flagged-reviews',
  templateUrl: './flagged-reviews.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlaggedReviews {
  protected readonly reviews = [
    {
      product: 'Pain de mie',
      rating: '2/5',
      reason: 'Propos inappropriés',
      author: 'Sarah Kanku',
      date: '03 oct.',
    },
    {
      product: 'Baskets Adidas',
      rating: '4/5',
      reason: 'Avis potentiellement dupliqué',
      author: 'David Mbala',
      date: '02 oct.',
    },
  ];
}
