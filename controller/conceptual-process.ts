import { query } from 'mu';
import { jsonToCsv, queryResultToJson } from '../util/json-to-csv';
import { paginationToQueryValue, sortToQueryValue } from '../util/query-param';
import { getTotalCountOfConceptionalProcesses } from './count';

interface ConceptionalProcessTableFilters {
  sort?: string;
  page?: number;
  size?: number;
}

interface HeaderOption {
  sortProperty: string;
  field: string;
  label: string;
  order?: number;
}

export async function getConceptualProcessTableContent(
  filterOptions: ConceptionalProcessTableFilters,
) {
  const sortVarModelPropertyMap = {
    number: 'identifierNumber',
    category: 'categories',
    group: 'processGroups',
    domain: 'processDomains',
    title: 'title',
  };
  const meta = await getPaginationForContent(filterOptions);
  const tableContent = await getTableContent({
    sort: sortToQueryValue(filterOptions.sort, sortVarModelPropertyMap),
    pagination: paginationToQueryValue(
      filterOptions.page,
      meta.pagination.self.size,
    ),
  });
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
      label: 'Proces domein',
      order: 2,
    },
    {
      sortProperty: 'processGroups',
      field: 'group',
      label: 'Proces groep',
      order: 3,
    },
    {
      sortProperty: 'title',
      field: 'title',
      label: 'Hoofd proces',
      order: 4,
    },
    {
      sortProperty: 'identifierNumber',
      field: 'number',
      label: 'Number',
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
  filterOptions: ConceptionalProcessTableFilters,
) {
  const tableContent = await getConceptualProcessTableContent(filterOptions);

  return await jsonToCsv(tableContent.content);
}

async function getTableContent({ sort = '', pagination = '' }) {
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
        FILTER(?status != <http://lblod.data.gift/concepts/concept-status/gearchiveerd>)
      }
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
    }
    ${sort}
    ${pagination}
  `);

  return await queryResultToJson(queryResult);
}

async function getPaginationForContent(
  filterOptions: ConceptionalProcessTableFilters,
) {
  const count = await getTotalCountOfConceptionalProcesses();
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
