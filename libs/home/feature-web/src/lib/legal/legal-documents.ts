import type { LegalDocument } from './legal-document';
import { CONSUMER } from './legal-consumer';
import { DELETION } from './legal-deletion';
import { HELP } from './legal-help';
import { PRIVACY } from './legal-privacy';
import { TERMS } from './legal-terms';
import { USAGE } from './legal-usage';

/** Footer and page order of the legal and help documents. */
export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  TERMS,
  CONSUMER,
  USAGE,
  PRIVACY,
  DELETION,
  HELP,
];

export function legalDocument(slug: string): LegalDocument {
  return LEGAL_DOCUMENTS.find((doc) => doc.slug === slug) ?? HELP;
}
