/** One legal or help page, mirrored from the mobile app's legal texts. */
export interface LegalSection {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly bullets?: readonly string[];
  /** Rendered as a collapsible question in the help page. */
  readonly faq?: boolean;
}

export interface LegalDocument {
  /** URL path segment, e.g. `confidentialite`. */
  readonly slug: string;
  readonly title: string;
  readonly shortTitle: string;
  /** Meta description for search engines. */
  readonly description: string;
  readonly updated: string;
  readonly intro: string;
  readonly sections: readonly LegalSection[];
}
