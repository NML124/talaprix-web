export interface PreviewCartLine {
  readonly name: string;
  readonly price: number;
  readonly shop: string;
}
export interface PreviewCartGroup {
  readonly shop: string;
  readonly items: readonly PreviewCartLine[];
}
