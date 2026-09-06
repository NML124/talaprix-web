import { componentGenerator } from '@nx/angular/generators';
import {
  formatFiles,
  joinPathFragments,
  names,
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import type { UiComponentGeneratorSchema } from './schema';

export async function uiComponentGenerator(
  tree: Tree,
  options: UiComponentGeneratorSchema,
) {
  const project = readProjectConfiguration(tree, options.project);
  const tags = project.tags ?? [];

  if (!tags.includes('type:ui')) {
    throw new Error(
      `Project "${options.project}" must be tagged "type:ui" to receive UI components.`,
    );
  }

  const componentName = names(options.name).fileName;
  const componentPath = joinPathFragments(
    project.sourceRoot ?? joinPathFragments(project.root, 'src'),
    'lib',
    options.directory ?? '',
    componentName,
    componentName,
  );

  await componentGenerator(tree, {
    path: componentPath,
    name: options.name,
    prefix: options.prefix ?? 'tpx',
    standalone: true,
    changeDetection: 'OnPush',
    style: 'scss',
    displayBlock: true,
    export: true,
    skipTests: false,
    type: 'component',
    skipFormat: true,
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default uiComponentGenerator;
