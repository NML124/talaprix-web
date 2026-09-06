import { addProjectConfiguration, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { uiComponentGenerator } from './ui-component';
import { UiComponentGeneratorSchema } from './schema';

describe('ui-component generator', () => {
  let tree: Tree;
  const options: UiComponentGeneratorSchema = {
    name: 'price-badge',
    project: 'shared-ui-kit',
    skipFormat: true,
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'shared-ui-kit', {
      root: 'libs/shared/ui-kit',
      sourceRoot: 'libs/shared/ui-kit/src',
      projectType: 'library',
      prefix: 'tpx',
      tags: ['scope:shared', 'type:ui', 'platform:shared'],
      targets: {},
    });
    tree.write('libs/shared/ui-kit/src/index.ts', '');
  });

  it('should run successfully', async () => {
    await uiComponentGenerator(tree, options);
    expect(
      tree.exists(
        'libs/shared/ui-kit/src/lib/price-badge/price-badge.component.ts',
      ),
    ).toBe(true);
    expect(tree.read('libs/shared/ui-kit/src/index.ts', 'utf-8')).toContain(
      'price-badge.component',
    );
    expect(
      tree.exists(
        'libs/shared/ui-kit/src/lib/price-badge/price-badge.component.scss',
      ),
    ).toBe(false);
    expect(
      tree.exists(
        'libs/shared/ui-kit/src/lib/price-badge/price-badge.component.css',
      ),
    ).toBe(false);
  });
});
