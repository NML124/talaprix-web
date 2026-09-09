import { mapCategory, visibleCategories } from './category';

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
