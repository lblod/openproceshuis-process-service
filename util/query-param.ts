export function sortToQueryValue(sort?: string, varModelPropertyMap = null) {
  if (!sort) {
    return '';
  }

  const ascOrDesc = sort.startsWith('-') ? 'DESC' : 'ASC';
  let property = sort.replace('-', '');

  if (varModelPropertyMap && property in varModelPropertyMap) {
    property = varModelPropertyMap[property];
  }

  return `ORDER BY ${ascOrDesc}(LCASE(?${property}))`;
}

export function paginationToQueryValue(page?: number, size?: number) {
  if (!page) {
    return '';
  }

  return `LIMIT ${size ?? 15} OFFSET ${page}`;
}
