import { displayCategories, mapCategory, visibleCategories } from './category';

describe('category mapping and visibility', () => {
  it('maps the tolerated API shape and defaults visibility to true', () => {
    expect(
      mapCategory({
        category_id: 'phones',
        name: 'Téléphones',
        category_picture: 'phone.png',
        parent_category_id: 'tech',
        parent: { name: 'High-Tech' },
      }),
    ).toEqual({
      id: 'phones',
      name: 'Téléphones',
      image: 'phone.png',
      parentCategoryId: 'tech',
      parentName: 'High-Tech',
      isClientVisible: true,
    });
  });

  it('hides a child when a known ancestor is invisible', () => {
    const categories = [
      category('parent', null, false),
      category('child', 'parent', true),
      category('visible', null, true),
    ];

    expect(visibleCategories(categories).map(({ id }) => id)).toEqual([
      'visible',
    ]);
  });

  it('prevents a cyclic branch from being displayed', () => {
    const categories = [
      category('first', 'second', true),
      category('second', 'first', true),
    ];

    expect(visibleCategories(categories)).toEqual([]);
  });

  it('shows one smartphone tile and the two specific computer categories with their API IDs', () => {
    const entries = [
      { ...category('phone', null, true), name: 'Téléphones' },
      { ...category('smart', null, true), name: 'Smartphones' },
      { ...category('computers', null, true), name: 'Ordinateurs' },
      {
        ...category('laptops', 'computers', true),
        name: 'Ordinateurs portables',
      },
      {
        ...category('desktop', 'computers', true),
        name: 'Ordinateurs de bureau',
      },
    ];
    expect(
      displayCategories(entries).map(({ id, name, parentCategoryId }) => [
        id,
        name,
        parentCategoryId,
      ]),
    ).toEqual([
      ['smart', 'Smartphones', null],
      ['laptops', 'Ordinateurs portables', null],
      ['desktop', 'Ordinateurs de bureau', null],
    ]);
  });
});

function category(
  id: string,
  parentCategoryId: string | null,
  isClientVisible: boolean,
) {
  return {
    id,
    name: id,
    image: null,
    parentCategoryId,
    parentName: null,
    isClientVisible,
  };
}
