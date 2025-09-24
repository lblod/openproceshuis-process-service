import { query, sparqlEscapeString } from 'mu';
import { jsonToCsv, queryResultToJson } from '../util/json-to-csv';
import { paginationToQueryValue, sortToQueryValue } from '../util/query-param';
import { getTotalCountOfConceptualProcesses } from './count';

interface ConceptualProcessTableFilters {
  sort?: string;
  page?: number;
  size?: number;
  categoryId?: string;
  domainId?: string;
  groupId?: string;
  title?: string;
}
interface SparqlFilters {
  sort?: string;
  pagination?: string;
  category?: string;
  domain?: string;
  group?: string;
  title?: string;
}

interface HeaderOption {
  sortProperty: string;
  field: string;
  label: string;
  order?: number;
}

export async function getConceptualProcessTableContent(
  filterOptions: ConceptualProcessTableFilters,
) {
  const meta = await getPaginationForContent(filterOptions);
  const tableContent = await getTableContent(filterOptions);
  const header: Array<HeaderOption> = [
    {
      sortProperty: 'process',
      field: 'id',
      label: 'uri',
    },
    {
      sortProperty: 'id',
      field: 'id',
      label: 'id',
    },
    {
      sortProperty: 'categories',
      field: 'category',
      label: 'Categorie',
      order: 1,
    },
    {
      sortProperty: 'processDomains',
      field: 'domain',
      label: 'Procesdomein',
      order: 2,
    },
    {
      sortProperty: 'processGroups',
      field: 'group',
      label: 'Procesgroep',
      order: 3,
    },
    {
      sortProperty: 'title',
      field: 'title',
      label: 'Hoofdproces',
      order: 4,
    },
    {
      sortProperty: 'identifierNumber',
      field: 'number',
      label: 'Nummer',
      order: 5,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const content = Object.entries(tableContent).map(([key, process]) => {
    const visual = {};
    Object.entries(process).map(([key, value]) => {
      const label = header.find((h) => h.sortProperty === key)?.label;
      visual[label] = value;
    });
    return visual;
  });

  return {
    headerLabels: header
      .filter((h) => h.order)
      .sort((a, b) => a.order - b.order),
    content: content,
    meta,
  };
}

export async function getConceptualProcessExport(
  filterOptions: ConceptualProcessTableFilters,
) {
  const tableContent = await getConceptualProcessTableContent(filterOptions);
  const contentInOrder = tableContent.content.map((process) => {
    return Object.fromEntries(
      tableContent.headerLabels.map((header) => [
        header.label,
        process[header.label],
      ]),
    );
  });

  return await jsonToCsv(contentInOrder);
}

async function getTableContent(filters: ConceptualProcessTableFilters) {
  const sparqlFilters = getSparqlFiltersForFilters(filters);
  const queryResult = await query(`
    PREFIX oph: <http://lblod.data.gift/vocabularies/openproceshuis/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT DISTINCT ?process ?id ?identifierNumber ?title
                    (GROUP_CONCAT(DISTINCT ?category; SEPARATOR=" / ") AS ?categories)
                    (GROUP_CONCAT(DISTINCT ?processDomain; SEPARATOR=" / ") AS ?processDomains)
                    (GROUP_CONCAT(DISTINCT ?processGroup; SEPARATOR=" / ") AS ?processGroups)
    WHERE {
      ?process a oph:ConceptueelProces .
      ?process mu:uuid ?id .
      OPTIONAL {
        ?process dct:title ?title .
      }
      OPTIONAL {
        ?process adms:status ?status .
      }
      ${sparqlFilters.category || ''}
      OPTIONAL {
        ?process oph:procesGroep / skos:relatedMatch / skos:relatedMatch / skos:prefLabel ?category .
      }
      OPTIONAL {
        ?process oph:procesGroep / skos:relatedMatch / skos:prefLabel ?processDomain .
      }
      OPTIONAL {
        ?process oph:procesGroep / skos:prefLabel ?processGroup .
      }
      OPTIONAL {
        ?process dct:identifier ?identifierNumber .
      }
      BIND(IF(BOUND(?status), ?status,  <http://lblod.data.gift/concepts/concept-status/canShowInOPH>) as ?safeStatus) # magic url
      FILTER(?safeStatus != <http://lblod.data.gift/concepts/concept-status/gearchiveerd>)
    }
    ${sparqlFilters.sort}
    ${sparqlFilters.pagination}
  `);

  return await queryResultToJson(queryResult);
}

function getSparqlFiltersForFilters(
  filters: ConceptualProcessTableFilters,
): SparqlFilters {
  const sortVarModelPropertyMap = [
    { fieldName: 'number', var: 'identifierNumber' },
    { fieldName: 'category', var: 'categories', lowerCase: true },
    { fieldName: 'group', var: 'processGroups', lowerCase: true },
    { fieldName: 'domain', var: 'processDomains', lowerCase: true },
    { fieldName: 'title', var: 'title', lowerCase: true },
  ];
  const sparqlFilters = {
    sort: sortToQueryValue(filters.sort, sortVarModelPropertyMap),
    pagination: paginationToQueryValue(filters.page, filters.size),
  };

  if (filters.categoryId) {
    sparqlFilters['category'] = `
      ?process oph:procesGroep / skos:relatedMatch / skos:relatedMatch / mu:uuid ${sparqlEscapeString(filters.categoryId)} .
    `;
  }

  return sparqlFilters;
}

async function getPaginationForContent(
  filterOptions: ConceptualProcessTableFilters,
) {
  const count = await getTotalCountOfConceptualProcesses();
  const { page, size } = filterOptions;
  const lastPage = Math.floor(count / size);
  const meta = {
    count,
    pagination: {
      first: {
        number: 0,
      },
      self: {
        number: page,
        size: size,
      },
      last: {
        number: lastPage,
      },
      prev: undefined,
      next: undefined,
    },
  };
  if (page && page > 0) {
    meta.pagination.prev = {
      number: page - 1,
      size: size,
    };
  }
  if (page === lastPage) {
    meta.pagination.self = {
      number: page,
      size: Math.abs(count - page * size),
    };
  }
  if (page * size < count) {
    meta.pagination.next = {
      number: page + 1,
      size: size,
    };
  }

  return meta;
}
