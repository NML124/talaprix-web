import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-home-hero',
  imports: [],
  templateUrl: './home-hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHero {}
