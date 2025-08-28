export function sortToQueryValue(sort?: string) {
  if (!sort) {
    return '';
  }

  const ascOrDesc = sort.startsWith('-') ? 'DESC' : 'ASC';
  const property = sort.replace('-', '');

  return `ORDER BY ${ascOrDesc}(?${property})`;
}

export function paginationToQueryValue(page?: number, size?: number) {
  if (!page) {
    return '';
  }

  return `LIMIT ${size ?? 15} OFFSET ${page}`;
}
