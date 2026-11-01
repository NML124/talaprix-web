import type { LegalDocument } from './legal-document';

export const HELP: LegalDocument = {
  slug: 'aide',
  title: 'Aide et contact',
  shortTitle: 'Aide et contact',
  description:
    'Contacter le support TalaPrix et trouver des réponses aux questions fréquentes.',
  updated: 'Version du 10 octobre 2026 · En vigueur depuis le 10 octobre 2026',
  intro:
    'Cette page vous indique comment contacter TalaPrix et transmettre les informations utiles pour obtenir de l’aide. Elle couvre les problèmes techniques, les fiches produits, les comptes, les services payants et les demandes des boutiques.',
  sections: [
    {
      title: '1 Contacter le support TalaPrix',
      paragraphs: [
        'Pour une difficulté dans l’application ou sur le site, une erreur de prix, une boutique introuvable ou une question sur votre compte, contactez le support officiel.',
        'Adresse électronique : support@talaprix.com. Téléphone ou WhatsApp : +243980000147. Horaires et jours d’assistance : du lundi au samedi, de 08h00 à 16h30, heure de Kinshasa. Site : https://talaprix.com.',
        'Utilisez uniquement les coordonnées indiquées dans l’application ou sur le site officiel. Le support ne vous demande pas votre mot de passe ni un code confidentiel de paiement.',
      ],
    },
    {
      title: '2 Informations utiles dans votre demande',
      paragraphs: [
        'Précisez le problème, la date, le nom du produit ou de la boutique et ce que vous avez déjà essayé. Pour un incident technique, indiquez le modèle de téléphone, la version de l’application et le message d’erreur. Pour un service payé, ajoutez la référence de transaction et le canal de paiement.',
        'Une capture peut aider, à condition de masquer les informations confidentielles. Ne joignez pas de document d’identité ou de coordonnées bancaires complètes sauf demande justifiée par un canal adapté.',
      ],
    },
    {
      title: '3 Signaler un prix ou une disponibilité inexacts',
      paragraphs: [
        'Identifiez la fiche, indiquez l’information affichée et l’information confirmée par la boutique, avec la date. TalaPrix pourra examiner la source et demander une correction. Avant votre déplacement, confirmez toujours le prix, le modèle et le stock auprès du commerçant.',
      ],
    },
    {
      title: '4 Retrouver une boutique',
      paragraphs: [
        'Consultez l’adresse et la position disponibles sur la fiche. Ouvrez l’itinéraire lorsque cette option est proposée. Si la carte ou le GPS ne fonctionne pas, vérifiez votre connexion et les autorisations de localisation ; demandez ensuite l’adresse ou un repère au commerçant.',
        'Si le point sur la carte est incorrect, transmettez au support le nom de la boutique et le repère confirmé. Ne communiquez pas votre position privée si elle n’est pas nécessaire.',
      ],
    },
    {
      title: '5 Compte et accès',
      paragraphs: [
        'En cas de difficulté de connexion, vérifiez le moyen d’identification utilisé et suivez la procédure de récupération disponible. Si vous suspectez un accès non autorisé, sécurisez vos identifiants et contactez le support sans attendre.',
        'Pour fermer votre compte, utilisez la fonction proposée ou demandez la fermeture au support. Si vous avez un abonnement, vérifiez séparément sa résiliation auprès du canal de souscription. Pour exercer un droit sur vos données, consultez la Politique de confidentialité.',
      ],
    },
    {
      title: '6 Abonnements et paiement d’un service TalaPrix',
      paragraphs: [
        'Consultez les conditions de l’offre et identifiez le prestataire ayant traité le paiement. Demandez au support une vérification en joignant la référence et la date de transaction. Évitez de recommencer plusieurs paiements tant qu’une transaction incertaine n’a pas été clarifiée.',
        'La facturation, la résiliation et le remboursement suivent les conditions de l’offre et le droit applicable. Lorsqu’une boutique d’applications gère l’abonnement, la démarche peut devoir être effectuée dans votre compte auprès de celle-ci.',
      ],
    },
    {
      title: '7 Problème avec un achat en boutique',
      paragraphs: [
        'Contactez d’abord le vendeur pour un défaut, une livraison, une garantie, un retour ou un remboursement. Conservez la facture, les messages et les justificatifs utiles. TalaPrix peut recevoir un signalement concernant une fiche ou une pratique suspecte ; le support ne se substitue pas au vendeur.',
        'En cas de fraude présumée, cessez de transmettre des informations confidentielles, contactez le prestataire de paiement pour connaître vos possibilités et saisissez les autorités compétentes si nécessaire.',
      ],
    },
    {
      title: '8 Demande d’une boutique partenaire',
      paragraphs: [
        'Pour référencer votre boutique, contactez le support en indiquant le nom commercial, la commune, l’adresse, les coordonnées professionnelles et les catégories de produits. N’envoyez pas l’ensemble de vos documents administratifs avant de connaître les pièces nécessaires.',
        'Les conditions d’intégration, les prestations incluses et les tarifs éventuels vous sont communiqués avant votre accord. Vous pouvez également demander la correction de vos produits, de vos prix, de vos horaires ou de votre localisation.',
      ],
    },
    {
      title: '9 Suivi de votre demande',
      paragraphs: [
        'Conservez la référence de dossier si elle vous est communiquée. Si vous relancez, répondez au même échange en ajoutant les informations nouvelles. Le support répond selon la nature du problème et les délais légaux applicables ; aucun délai commercial précis n’est annoncé sans confirmation de sa capacité à le respecter.',
      ],
    },
    {
      title: '1 Qu’est ce que TalaPrix',
      paragraphs: [
        'TalaPrix est une plateforme qui vous aide à trouver un produit, connaître son prix et sa disponibilité annoncés, identifier la boutique et la contacter. Vous pouvez aussi consulter sa localisation lorsque cette information est disponible.',
      ],
      faq: true,
    },
    {
      title: '2 Quels produits puis je rechercher',
      paragraphs: [
        'Le catalogue dépend des boutiques et produits référencés. Le lancement de TalaPrix vise notamment les téléphones, les ordinateurs, les power banks et les accessoires électroniques à Kinshasa. Le catalogue peut évoluer et ne couvre pas tous les produits du marché.',
      ],
      faq: true,
    },
    {
      title: '3 TalaPrix vend il les produits présentés',
      paragraphs: [
        'Pour le service de référencement et de mise en relation, les produits sont vendus par les boutiques. Vous convenez directement avec le commerçant des modalités de vente, de paiement, de retrait ou de livraison. TalaPrix n’encaisse pas le prix des produits dans ce périmètre.',
      ],
      faq: true,
    },
    {
      title: '4 Comment rechercher un produit',
      paragraphs: [
        'Saisissez le nom, la marque ou le modèle dans la recherche et consultez les fiches proposées. Utilisez les filtres disponibles. Vérifiez le modèle, les caractéristiques, la boutique et la date de mise à jour lorsqu’elle est affichée.',
      ],
      faq: true,
    },
    {
      title: '5 Le prix et le stock sont ils garantis',
      paragraphs: [
        'Un prix peut changer et un produit peut être épuisé après sa publication. Contactez la boutique pour confirmer le prix total, la devise et la disponibilité avant de vous déplacer ou de payer. TalaPrix examine les erreurs signalées.',
      ],
      faq: true,
    },
    {
      title: '6 Comment contacter une boutique sur WhatsApp',
      paragraphs: [
        'Sur la fiche, utilisez le bouton de contact lorsqu’il est disponible. WhatsApp peut s’ouvrir avec le numéro du commerçant ou un message préparé. Relisez le message et décidez de l’envoyer. Si le bouton ne fonctionne pas, vérifiez l’installation de WhatsApp ou utilisez les autres coordonnées affichées.',
      ],
      faq: true,
    },
    {
      title: '7 Comment me rendre à la boutique',
      paragraphs: [
        'Consultez son adresse et sa position sur la carte, puis ouvrez l’itinéraire si cette option est proposée. Confirmez l’adresse et les horaires auprès du commerçant avant votre déplacement.',
      ],
      faq: true,
    },
    {
      title: '8 Dois je autoriser ma localisation',
      paragraphs: [
        'Vous choisissez d’autoriser ou de refuser l’accès à votre position. Cette autorisation peut faciliter certaines fonctions de proximité ou d’itinéraire. Vous pouvez la retirer dans les paramètres du téléphone ; les fonctions qui en dépendent peuvent alors être limitées.',
      ],
      faq: true,
    },
    {
      title: '9 Faut il créer un compte',
      paragraphs: [
        'Cela dépend de la fonctionnalité. Si un compte est nécessaire, l’application vous l’indique. Les possibilités de consultation et les fonctions réservées aux comptes sont celles proposées dans la version utilisée.',
      ],
      faq: true,
    },
    {
      title: '10 TalaPrix est il gratuit',
      paragraphs: [
        'Les fonctionnalités gratuites et payantes sont indiquées dans l’application ou sur le site. Consulter une fiche ne déclenche pas à lui seul une facturation TalaPrix. Avant de souscrire un service payant, vous pouvez consulter son prix et ses conditions.',
      ],
      faq: true,
    },
    {
      title: '11 Comment fonctionnent les alertes de prix',
      paragraphs: [
        'Si les alertes sont disponibles, choisissez le produit et les critères proposés, puis activez les notifications nécessaires. Une alerte dépend des informations reçues par TalaPrix ; elle ne constitue pas une réservation et ne garantit pas le maintien du prix.',
      ],
      faq: true,
    },
    {
      title: '12 Le panier réserve t il mes produits',
      paragraphs: [
        'Dans le périmètre de mise en relation, une liste ou un panier de préparation ne vaut pas commande, paiement ni réservation de stock. Une réservation suppose une confirmation explicite de la boutique selon ses conditions.',
      ],
      faq: true,
    },
    {
      title: '13 Une estimation d’économie est elle garantie',
      paragraphs: [
        'Une estimation éventuelle dépend des prix disponibles et des paramètres utilisés. Elle ne garantit pas une économie réelle ni le prix le plus bas du marché. Faites confirmer les montants et les frais par le commerçant.',
      ],
      faq: true,
    },
    {
      title: '14 Comment signaler une information incorrecte',
      paragraphs: [
        'Contactez le support avec le nom du produit et de la boutique, la date et la correction demandée. Si possible, joignez une capture et la confirmation du commerçant en masquant les informations confidentielles.',
      ],
      faq: true,
    },
    {
      title: '15 Comment obtenir une garantie ou un remboursement',
      paragraphs: [
        'Pour un produit acheté, adressez votre demande à la boutique avec votre justificatif d’achat. Pour un service payant TalaPrix, consultez les conditions de l’offre et contactez le support ou le prestataire ayant géré votre paiement. Vos droits légaux restent applicables.',
      ],
      faq: true,
    },
    {
      title: '16 Pourquoi certains résultats sont ils mis en avant',
      paragraphs: [
        'Une mise en avant peut avoir une nature commerciale. Lorsqu’un paiement influence la présentation d’un résultat, cette mise en avant doit être signalée. Elle ne certifie pas la qualité du produit ou du vendeur.',
      ],
      faq: true,
    },
    {
      title: '17 Comment désactiver les notifications',
      paragraphs: [
        'Utilisez les options proposées dans les paramètres de TalaPrix et les réglages de notifications du téléphone. Les communications nécessaires au fonctionnement du compte peuvent continuer par un autre canal approprié.',
      ],
      faq: true,
    },
    {
      title: '18 Comment fermer mon compte',
      paragraphs: [
        'Utilisez la fonction de fermeture proposée ou contactez le support. Vérifiez séparément la résiliation d’un abonnement éventuel. La Politique de confidentialité explique le traitement des données et les demandes d’effacement.',
      ],
      faq: true,
    },
    {
      title: '19 Comment référencer ma boutique',
      paragraphs: [
        'Contactez le support avec le nom commercial, l’adresse, la commune, un contact professionnel et les catégories de produits. Les conditions d’intégration et les tarifs éventuels sont précisés avant votre accord. Vous devez fournir des informations exactes et les actualiser.',
      ],
      faq: true,
    },
    {
      title: '20 Comment joindre le support',
      paragraphs: [
        'Email : support@talaprix.com. Téléphone ou WhatsApp : +243980000147. Les coordonnées et horaires officiels sont disponibles dans la page Aide et support. Ne communiquez jamais votre mot de passe ou vos codes confidentiels.',
      ],
      faq: true,
    },
  ],
};
