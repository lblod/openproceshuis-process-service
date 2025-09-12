export function sortToQueryValue(
  sort?: string,
  varModelPropertyMapArray = null,
) {
  if (!sort) {
    return '';
  }

  const ascOrDesc = sort.startsWith('-') ? 'DESC' : 'ASC';
  const baseSortString = `ORDER BY ${ascOrDesc}`;

  const property = sort.replace('-', '');
  const item = varModelPropertyMapArray.find(
    (item) => item.fieldName === property,
  );
  let byLabel = `(?${item.var})`;
  if (item.lowerCase) {
    byLabel = `(LCASE(?${item.var}))`;
  }

  return `${baseSortString} ${byLabel}`;
}

export function paginationToQueryValue(page?: number, size?: number) {
  if (page == null || page == undefined) {
    return '';
  }
  const safeSize = size ? size : 20;

  return `LIMIT ${safeSize} OFFSET ${page * safeSize}`;
}
