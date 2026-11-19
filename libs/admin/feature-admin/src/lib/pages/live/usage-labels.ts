const actions: Record<string, string> = {
  button_clicked: 'Clic sur un bouton',
  cart_item_added: 'Ajout d’un produit au panier',
  cart_item_removed: 'Retrait d’un produit du panier',
  cart_offer_selected: 'Choix d’une offre pour le panier',
  cart_quantity_changed: 'Modification de la quantité dans le panier',
  cart_selection_saved: 'Enregistrement de la sélection du panier',
  category_clicked: 'Ouverture d’une catégorie',
  category_filter_applied: 'Filtrage par catégorie',
  favorite_added: 'Ajout aux favoris',
  favorite_removed: 'Retrait des favoris',
  map_product_search: 'Recherche d’un produit sur la carte',
  optimisation_result_viewed: 'Consultation du résultat de l’optimisation',
  optimisation_started: 'Lancement de l’optimisation du panier',
  preference_changed: 'Modification d’une préférence',
  price_alert_created: 'Création d’une alerte de prix',
  product_offers_sorted_nearby: 'Tri des offres par proximité',
  product_offers_viewed: 'Consultation des offres d’un produit',
  product_opened: 'Ouverture d’une fiche produit',
  product_request_login_required:
    'Demande de produit nécessitant une connexion',
  product_request_submitted: 'Envoi d’une demande de produit',
  product_search: 'Recherche d’un produit',
  product_search_zero_results: 'Recherche sans résultat',
  product_sort_changed: 'Changement du tri des produits',
  search_result_opened: 'Ouverture d’un résultat de recherche',
  seller_contact_opened: 'Consultation du contact d’un vendeur',
  product_shared: 'Partage d’un produit',
  shop_clicked: 'Ouverture d’une boutique',
  page_view: 'Consultation d’une page web',
};
const screens: Record<string, string> = {
  home: 'Accueil',
  cart: 'Panier',
  catalog_search: 'Recherche dans le catalogue',
  home_search: 'Recherche depuis l’accueil',
  map: 'Carte',
  optimisation: 'Optimisation du panier',
  product: 'Produit',
  product_comparison: 'Comparaison de produits',
  product_detail: 'Fiche produit',
  products: 'Catalogue de produits',
  settings: 'Paramètres',
  shop_offer_detail: 'Offre de la boutique',
  resultats: 'Résultats',
  recherche: 'Recherche',
  favoris: 'Favoris',
  categories: 'Catégories',
  boutiques: 'Boutiques',
  'boutiques/sans-position': 'Boutiques sans position',
  commercants: 'Devenir boutique',
  panier: 'Panier',
  contact: 'Contact',
  'conditions-utilisation': 'Conditions d’utilisation',
  'conditions-consommateur': 'Conditions du consommateur',
  'politique-utilisation': 'Politique d’utilisation',
  confidentialite: 'Confidentialité',
  'suppression-donnees': 'Suppression des données',
  aide: 'Aide',
};
export const actionLabel = (key: string) =>
  Object.prototype.hasOwnProperty.call(actions, key)
    ? actions[key]
    : 'Autre action';
export const screenLabel = (key: string | null) =>
  key && Object.prototype.hasOwnProperty.call(screens, key)
    ? screens[key]
    : 'Autre écran';
export function platformLabel(key: string | null) {
  switch (key?.toLowerCase()) {
    case 'flutter':
    case 'android':
    case 'ios':
    case 'mobile':
      return 'App mobile';
    case 'web':
      return 'App web';
    default:
      return 'Plateforme non identifiée';
  }
}
