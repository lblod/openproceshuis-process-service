export function sortToQueryValue(sort?: string) {
  if (!sort) {
    return '';
  }

  const ascOrDesc = sort.startsWith('-') ? 'DESC' : 'ASC';
  const property = sort.replace('-', '');

  return `ORDER BY ${ascOrDesc}(?${property})`;
}
