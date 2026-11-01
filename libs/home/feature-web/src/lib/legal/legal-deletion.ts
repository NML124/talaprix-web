import type { LegalDocument } from './legal-document';

export const DELETION: LegalDocument = {
  slug: 'suppression-donnees',
  title: 'Suppression des données',
  shortTitle: 'Suppression des données',
  description:
    'Comment demander la suppression de votre compte et de vos données TalaPrix.',
  updated: 'Dernière mise à jour : 5 juin 2026',
  intro:
    'Cette page explique comment demander la suppression des données personnelles associées à un compte TalaPrix.',
  sections: [
    {
      title: 'Demander une suppression',
      paragraphs: [
        "Pour demander la suppression de vos données personnelles, contactez TalaPrix en utilisant l'adresse e-mail ou le numéro de téléphone ci-dessous.",
        "Afin de vérifier la demande, utilisez de préférence l'adresse e-mail ou le numéro de téléphone associé à votre compte TalaPrix.",
      ],
      bullets: [
        'E-mail : elielkahindirwa@gmail.com',
        'Téléphone : +243 976 885 689',
        'Objet conseillé : Suppression de mes données TalaPrix',
      ],
    },
    {
      title: 'Informations à fournir',
      paragraphs: [
        "Votre demande doit contenir les informations minimales permettant d'identifier le compte concerné.",
      ],
      bullets: [
        'votre nom ou identifiant de compte, si disponible ;',
        "le numéro de téléphone ou l'adresse e-mail liée au compte ;",
        'une phrase indiquant clairement que vous demandez la suppression de vos données personnelles.',
      ],
    },
    {
      title: 'Données concernées',
      paragraphs: [
        'Lorsque la demande est validée, TalaPrix supprime ou anonymise les données personnelles associées au compte, dans la mesure permise par les obligations applicables.',
      ],
      bullets: [
        "informations de compte et d'authentification ;",
        'préférences et interactions associées au compte ;',
        "données de localisation associées au compte, lorsqu'elles existent ;",
        "notifications et éléments personnalisés liés à l'utilisateur.",
      ],
    },
    {
      title: 'Données pouvant être conservées',
      paragraphs: [
        "Certaines informations peuvent être conservées lorsqu'elles sont nécessaires au respect d'obligations légales, à la prévention des abus, à la sécurité du service ou à la résolution d'un litige.",
        "Les données déjà anonymisées ou agrégées peuvent être conservées, car elles ne permettent pas d'identifier directement un utilisateur.",
      ],
    },
    {
      title: 'Délai de traitement',
      paragraphs: [
        "TalaPrix traite les demandes dans un délai raisonnable après vérification de l'identité ou du compte concerné.",
        "Une confirmation peut être envoyée lorsque la suppression ou l'anonymisation est terminée.",
      ],
    },
    {
      title: 'Avant de supprimer votre compte',
      paragraphs: [
        "La suppression peut rendre indisponibles certaines fonctionnalités personnalisées, comme les favoris, l'historique, les alertes ou les préférences enregistrées.",
        "Si vous souhaitez seulement désactiver la localisation ou les notifications, vous pouvez le faire depuis les réglages de votre appareil ou de l'application, selon les options disponibles.",
      ],
    },
  ],
};
