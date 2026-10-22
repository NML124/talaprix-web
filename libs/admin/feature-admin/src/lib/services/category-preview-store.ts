import { computed, signal, Service } from '@angular/core';

export interface PreviewCategory {
  id: number;
  name: string;
  description: string;
  parentId: number | null;
  isClientVisible: boolean;
}

/** Catalogue de catégories local à la session de prévisualisation. */
@Service()
export class CategoryPreviewStore {
  private readonly rows = signal<PreviewCategory[]>([
    {
      id: 1,
      name: 'Boulangerie',
      description: 'Pains et produits de boulangerie',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 2,
      name: 'Épicerie',
      description: 'Alimentation et produits du quotidien',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 3,
      name: 'Mode',
      description: 'Vêtements et chaussures',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 4,
      name: 'Accessoires',
      description: 'Sacs et accessoires personnels',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 5,
      name: 'Électronique',
      description: 'Appareils et accessoires électroniques',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 6,
      name: 'Téléphones',
      description: 'Téléphones et smartphones',
      parentId: 5,
      isClientVisible: true,
    },
    {
      id: 7,
      name: 'Audio',
      description: 'Casques et équipements audio',
      parentId: 5,
      isClientVisible: true,
    },
    {
      id: 8,
      name: 'Bureautique',
      description: 'Imprimantes et fournitures',
      parentId: 5,
      isClientVisible: true,
    },
    {
      id: 9,
      name: 'Maison',
      description: 'Équipement et décoration',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 10,
      name: 'Beauté',
      description: 'Soins et hygiène',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 11,
      name: 'Bébé',
      description: 'Produits pour enfants',
      parentId: null,
      isClientVisible: true,
    },
    {
      id: 12,
      name: 'Automobile',
      description: 'Accessoires et entretien auto',
      parentId: null,
      isClientVisible: true,
    },
  ]);
  readonly categories = this.rows.asReadonly();
  readonly names = computed(() =>
    this.rows()
      .filter((row) => row.id !== 5)
      .map((row) => row.name),
  );

  isEffectivelyVisible(category: PreviewCategory): boolean {
    if (!category.isClientVisible) return false;
    if (category.parentId === null) return true;
    const parent = this.rows().find((row) => row.id === category.parentId);
    return parent ? this.isEffectivelyVisible(parent) : false;
  }

  descendantIds(categoryId: number): number[] {
    const direct = this.rows().filter((row) => row.parentId === categoryId);
    return direct.flatMap((row) => [row.id, ...this.descendantIds(row.id)]);
  }

  toggleVisibility(categoryId: number): number[] {
    const target = this.rows().find((row) => row.id === categoryId);
    if (!target) return [];
    const affected = [categoryId, ...this.descendantIds(categoryId)];
    const nextVisibility = !target.isClientVisible;
    this.rows.update((rows) =>
      rows.map((row) =>
        affected.includes(row.id)
          ? { ...row, isClientVisible: nextVisibility }
          : row,
      ),
    );
    return affected;
  }

  save(value: PreviewCategory): void {
    const name = value.name.trim();
    if (!name) throw new Error('Renseignez le nom de la catégorie.');
    if (
      this.rows().some(
        (row) =>
          row.id !== value.id &&
          row.name.toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'),
      )
    )
      throw new Error('Cette catégorie existe déjà.');
    const normalized = {
      ...value,
      name,
      parentId: value.parentId ?? null,
      isClientVisible: value.isClientVisible ?? true,
      description: value.description.trim(),
    };
    this.rows.update((rows) =>
      rows.some((row) => row.id === value.id)
        ? rows.map((row) => (row.id === value.id ? normalized : row))
        : [...rows, normalized],
    );
  }

  remove(id: number): void {
    this.rows.update((rows) => rows.filter((row) => row.id !== id));
  }
}
