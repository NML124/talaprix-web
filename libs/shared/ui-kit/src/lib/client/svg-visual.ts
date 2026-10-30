import { ChangeDetectionStrategy, Component, input } from '@angular/core';
/** Original design SVGs, shared through one local sprite instead of repeated paths. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- SVG requires a native host to preserve viewBox and inherited stroke.
  selector: 'svg[tpxVisual]',
  templateUrl: './svg-visual.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SvgVisual {
  readonly symbol = input.required<string>();
}
