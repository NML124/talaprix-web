import type { LegalDocument } from './legal-document';

export const PRIVACY: LegalDocument = {
  slug: 'confidentialite',
  title: 'Politique de confidentialité',
  shortTitle: 'Confidentialité',
  description:
    'Données utilisées par TalaPrix, localisation, notifications et vos droits.',
  updated: 'Dernière mise à jour : 5 juin 2026',
  intro:
    'Cette page explique de façon simple quelles informations peuvent être utilisées par TalaPrix, pourquoi elles le sont et comment elles sont traitées.',
  sections: [
    {
      title: 'Introduction',
      paragraphs: [
        'TalaPrix est une plateforme numérique congolaise destinée à aider les consommateurs à comparer les prix de produits dans plusieurs supermarchés et points de vente à Kinshasa.',
        'La présente politique de confidentialité explique quelles informations peuvent être utilisées dans le cadre du service, pourquoi elles le sont et comment elles sont traitées.',
      ],
    },
    {
      title: 'Informations pouvant être utilisées',
      paragraphs: [
        "Selon les fonctionnalités utilisées dans l'application, TalaPrix peut traiter les catégories d'informations suivantes :",
      ],
      bullets: [
        "des informations nécessaires à l'authentification et à la gestion du compte ;",
        "des informations de localisation lorsque l'utilisateur autorise cette fonctionnalité ;",
        "des informations liées aux préférences et aux interactions avec l'application ;",
        "des données de prix, d'offres et de consommation utilisées à des fins de comparaison et d'analyse.",
      ],
    },
    {
      title: 'Utilisation des informations',
      paragraphs: [
        'Les informations traitées par TalaPrix peuvent être utilisées pour :',
      ],
      bullets: [
        "permettre l'accès à l'application et à ses fonctionnalités ;",
        'afficher les magasins, offres et comparaisons les plus pertinents ;',
        'envoyer des alertes de promotions et autres notifications utiles ;',
        'améliorer la qualité du service et la pertinence des informations proposées ;',
        'produire des analyses globales sur les prix et la consommation.',
      ],
    },
    {
      title: 'Données anonymisées',
      paragraphs: [
        'Les données utilisées pour les comparaisons et les analyses de consommation sont traitées sous une forme anonymisée.',
      ],
      bullets: [
        "L'identité des sources individuelles de ces données n'est pas connue ou n'est pas exposée dans l'application.",
        'Ces données peuvent être utilisées pour faire une étude agrégée de la consommation de la population congolaise.',
        "Les analyses visées ont une finalité statistique, informationnelle et d'amélioration du service.",
      ],
    },
    {
      title: 'Localisation',
      paragraphs: [
        "Lorsque l'utilisateur autorise la localisation, TalaPrix utilise cette information pour afficher les boutiques les plus proches et mieux comparer leurs prix afin de proposer les offres les plus avantageuses à proximité.",
        "La localisation n'a pas pour objectif de suivre les déplacements de l'utilisateur en dehors des besoins de fonctionnement du service.",
      ],
    },
    {
      title: 'Notifications',
      paragraphs: [
        "Si l'utilisateur active les notifications, TalaPrix peut lui envoyer des alertes liées aux promotions, aux offres et à certaines informations utiles sur les produits ou les prix.",
        "L'utilisateur peut désactiver ces notifications à tout moment depuis les réglages de son appareil ou de l'application, selon les options disponibles.",
      ],
    },
    {
      title: 'Partage des informations',
      paragraphs: [
        'TalaPrix ne présente pas les données anonymisées comme des données nominatives.',
        'Les informations sont utilisées principalement pour faire fonctionner le service, proposer des comparaisons pertinentes et produire des analyses globales non nominatives.',
      ],
    },
    {
      title: 'Conservation',
      paragraphs: [
        "Les informations sont conservées pendant la durée nécessaire au fonctionnement du service, à l'amélioration de l'expérience utilisateur et au respect des obligations applicables.",
      ],
    },
    {
      title: "Choix de l'utilisateur",
      paragraphs: [],
    },
    {
      title: 'Contact',
      paragraphs: [
        "Pour toute question relative à la confidentialité ou à l'utilisation des données dans TalaPrix :",
      ],
      bullets: [
        'Téléphone : +243 976 885 689',
        'E-mail : elielkahindirwa@gmail.com',
      ],
    },
    {
      title: 'Mise à jour',
      paragraphs: [
        'Cette politique peut être mise à jour pour refléter les évolutions du service, des fonctionnalités ou des pratiques de traitement des informations.',
      ],
    },
  ],
};
