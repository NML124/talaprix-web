import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FooterBottom } from './bottom/footer-bottom';
import { FooterBrand } from './brand/footer-brand';
import { FooterDownload } from './download/footer-download';
import { FooterLink, FooterLinks } from './links/footer-links';
import { FooterNewsletter } from './newsletter/footer-newsletter';

@Component({
  selector: 'lib-home-footer',
  templateUrl: './home-footer.html',
  imports: [
    FooterNewsletter,
    FooterBrand,
    FooterLinks,
    FooterDownload,
    FooterBottom,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFooter {
  protected readonly linkSections: readonly {
    title: string;
    links: readonly FooterLink[];
  }[] = [
    {
      title: 'Découvrir',
      links: [
        { label: 'Catégories', href: '#categories' },
        { label: 'Meilleures offres', href: '#offres' },
        { label: 'Prix en baisse', href: '#' },
        { label: 'Produits populaires', href: '#' },
        { label: 'Magasins', href: '#' },
      ],
    },
    {
      title: 'Talaprix',
      links: [
        { label: 'À propos', href: '#' },
        { label: 'Comment ça marche ?', href: '#' },
        { label: 'Application mobile', href: '#download' },
        { label: 'Nos partenaires', href: '#' },
        { label: 'Carrières', href: '#' },
      ],
    },
    {
      title: 'Commerçants',
      links: [
        { label: 'Devenir partenaire', href: '#' },
        { label: 'Ajouter une boutique', href: '#' },
        { label: 'Référencer des produits', href: '#' },
        { label: 'Espace commerçant', href: '#' },
        { label: 'Centre partenaires', href: '#' },
      ],
    },
    {
      title: 'Assistance',
      links: [
        { label: "Centre d'aide", href: '#' },
        { label: 'FAQ', href: '#' },
        { label: 'Nous contacter', href: '#' },
        { label: 'Signaler un prix', href: '#' },
        { label: 'Signaler un problème', href: '#' },
      ],
    },
  ];
}
