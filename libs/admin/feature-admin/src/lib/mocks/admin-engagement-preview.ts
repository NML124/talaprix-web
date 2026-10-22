/** Fictitious 30-day counters. Global people counts deduplicate across shops. */
export const adminEngagementPreview = {
  period: '30 derniers jours',
  contactPeople: 1264,
  locatePeople: 948,
  favoritePeople: 2371,
  shops: [
    {
      name: 'DRC Mart',
      contactPeople: 214,
      locatePeople: 168,
      favoritePeople: 392,
    },
    {
      name: 'UAC Kintambo',
      contactPeople: 187,
      locatePeople: 144,
      favoritePeople: 311,
    },
    {
      name: 'Dickcom Shop',
      contactPeople: 96,
      locatePeople: 72,
      favoritePeople: 153,
    },
    {
      name: 'Atelier Kin',
      contactPeople: 84,
      locatePeople: 61,
      favoritePeople: 143,
    },
  ],
} as const;
