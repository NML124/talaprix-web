import { Directive, input } from '@angular/core';
@Directive({
  selector: 'img[tpxShopAvatar]',
  host: {
    '[attr.src]': "image() || '/client-design/assets/logo-talaprix.png'",
  },
})
export class ShopAvatar {
  readonly image = input<string | null>(null);
}
