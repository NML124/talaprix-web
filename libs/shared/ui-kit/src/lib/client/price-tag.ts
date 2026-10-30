import { Directive, input } from '@angular/core';
@Directive({ selector: '[tpxPriceTag]', host: { '[textContent]': 'value()' } })
export class PriceTag {
  readonly value = input.required<string>();
}
