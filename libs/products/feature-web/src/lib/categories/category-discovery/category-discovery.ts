import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tpx-category-discovery',
  imports: [RouterLink],
  templateUrl: './category-discovery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDiscovery {}
