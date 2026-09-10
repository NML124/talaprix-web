import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeNavbar } from '../home/navbar/home-navbar';
import { HomeFooter } from '../home/footer/home-footer';

@Component({
  selector: 'lib-public-shell',
  imports: [HomeNavbar, HomeFooter, RouterOutlet],
  templateUrl: './public-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicShell {}
