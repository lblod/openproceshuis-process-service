import { query } from 'mu';
import { jsonToCsv, queryResultToJson } from '../util/json-to-csv';
import { paginationToQueryValue, sortToQueryValue } from '../util/query-param';

interface ConceptionalProcessTableFilters {
  sort?: string;
  page?: number;
  size?: number;
}

export async function getConceptualProcessExport(
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

  return await jsonToCsv(content);
}

async function getTableContent({ sort = '', pagination = '' }) {
  const queryResult = await query(`
    PREFIX oph: <http://lblod.data.gift/vocabularies/openproceshuis/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT ?process ?identifierNumber ?title
                    (GROUP_CONCAT(DISTINCT ?category; SEPARATOR=" / ") AS ?categories)
                    (GROUP_CONCAT(DISTINCT ?processDomain; SEPARATOR=" / ") AS ?processDomains)
                    (GROUP_CONCAT(DISTINCT ?processGroup; SEPARATOR=" / ") AS ?processGroups)
    WHERE {
      ?process a oph:ConceptueelProces .
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
  const varLabelMap = {
    process: 'Uri',
    categories: 'Categorie',
    processDomains: 'Proces domein',
    processGroups: 'Proces groep',
    title: 'Hoofd proces',
    identifierNumber: 'Number',
  };

  return queryResultToJson(queryResult, varLabelMap);
}
