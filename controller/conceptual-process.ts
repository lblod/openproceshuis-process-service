import { query } from 'mu';
import { jsonToCsv, queryResultToJson } from '../util/json-to-csv';
import { paginationToQueryValue, sortToQueryValue } from '../util/query-param';

interface ConceptionalProcessTableFilters {
  sort?: string;
  page?: number;
  size?: number;
}

interface HeaderOption {
  sortProperty: string;
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
  const content = await getTableContent({
    sort: sortToQueryValue(filterOptions.sort, sortVarModelPropertyMap),
    pagination: paginationToQueryValue(filterOptions.page, filterOptions.size),
  });
  const header: Array<HeaderOption> = [
    {
      sortProperty: 'process',
      label: 'uri',
    },
    {
      sortProperty: 'id',
      label: 'id',
    },
    {
      sortProperty: 'categories',
      label: 'Categorie',
      order: 1,
    },
    {
      sortProperty: 'processDomains',
      label: 'Proces domein',
      order: 2,
    },
    {
      sortProperty: 'processGroups',
      label: 'Proces groep',
      order: 3,
    },
    {
      sortProperty: 'title',
      label: 'Hoofd proces',
      order: 4,
    },
    {
      sortProperty: 'identifierNumber',
      label: 'Number',
      order: 5,
    },
  ];

  return {
    headerLabels: header
      .filter((h) => h.order)
      .sort((a, b) => a.order - b.order),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    content: Object.entries(content).map(([key, process]) => {
      const visual = {};
      Object.entries(process).map(([key, value]) => {
        const label = header.find((h) => h.sortProperty === key)?.label;
        visual[label] = value;
      });
      return visual;
    }),
  };
}

export async function getConceptualProcessExport(
  filterOptions: ConceptionalProcessTableFilters,
) {
  const tableContent =
    await this.getConceptualProcessTableContent(filterOptions);

  return await jsonToCsv(tableContent.data);
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
