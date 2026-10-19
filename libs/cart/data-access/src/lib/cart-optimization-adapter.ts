import { Service } from '@angular/core';
import type {
  CartItem,
  OptimizationStrategy,
  ShoppingPlan,
  ShoppingRouteStop,
} from '@talaprix/cart/domain';

/**
 * Local stand-in for the recommend-shopping-plan Edge Function. Its shape is
 * deliberately async so the UI can later switch to the real function without
 * moving optimization logic into a component.
 */
@Service({ autoProvided: false })
export class CartOptimizationAdapter {
  async optimize(
    items: readonly CartItem[],
    strategy: OptimizationStrategy,
  ): Promise<ShoppingPlan> {
    await new Promise<void>((resolve) => setTimeout(resolve, 450));

    const stops = this.toStops(items, strategy);
    const total = stops.reduce((sum, stop) => sum + stop.subtotal, 0);
    const totalDistanceKm = Number(
      stops.reduce((sum, stop) => sum + stop.distanceKm, 0).toFixed(1),
    );

    return {
      strategy,
      total,
      totalDistanceKm,
      stopCount: stops.length,
      savings: items.reduce(
        (sum, item) => sum + item.saving * item.quantity,
        0,
      ),
      effortSaved:
        strategy === 'savings'
          ? 'prix comparés auprès de 3 boutiques'
          : 'trajet regroupé autour de Gombe',
      stops,
    };
  }

  private toStops(
    items: readonly CartItem[],
    strategy: OptimizationStrategy,
  ): readonly ShoppingRouteStop[] {
    const byShop = new Map<string, CartItem[]>();
    for (const item of items) {
      byShop.set(item.shopName, [...(byShop.get(item.shopName) ?? []), item]);
    }

    return [...byShop.entries()]
      .map(([shopName, shopItems]) => ({
        id: shopName.toLowerCase().replace(/ /g, '-'),
        shopName,
        area: shopItems[0].area,
        address: shopItems[0].address,
        distanceKm: shopItems[0].distanceKm,
        subtotal: shopItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        ),
        items: shopItems,
      }))
      .sort((first, second) =>
        strategy === 'comfort'
          ? first.distanceKm - second.distanceKm
          : second.subtotal - first.subtotal,
      );
  }
}
