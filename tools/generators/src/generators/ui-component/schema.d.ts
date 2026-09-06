export interface UiComponentGeneratorSchema {
  name: string;
  project: string;
  directory?: string;
  prefix?: string;
  skipFormat?: boolean;
}
