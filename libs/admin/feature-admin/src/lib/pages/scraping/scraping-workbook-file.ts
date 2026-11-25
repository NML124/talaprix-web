/** Immediate feedback only; the API separately validates the workbook contents. */
export function workbookFileError(file: Pick<File, 'name' | 'size'>): string {
  if (!file.name.toLowerCase().endsWith('.xlsx'))
    return 'Format non pris en charge. Choisissez un fichier Excel .xlsx.';
  if (file.size === 0 || file.size > 8 * 1024 * 1024)
    return 'Le fichier doit contenir des données et ne pas dépasser 8 Mo.';
  return '';
}
