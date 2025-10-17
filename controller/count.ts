import { query } from 'mu';
import {
  ConceptualProcessTableFilters,
  getSparqlFiltersForFilters,
} from './conceptual-process';

export async function getTotalCountOfConceptualProcesses(
  filters: ConceptualProcessTableFilters,
) {
  const sparqlFilters = getSparqlFiltersForFilters(filters);
  const filterString = [
    {
      use: sparqlFilters.category,
      filter: `
        ?process oph:procesGroep / skos:relatedMatch / skos:relatedMatch ?categoryUri .
        ${sparqlFilters.category}
        `,
    },
    {
      use: sparqlFilters.domain,
      filter: `
        ?process oph:procesGroep / skos:relatedMatch ?processDomainUri .
        ${sparqlFilters.domain}
        `,
    },
    {
      use: sparqlFilters.group,
      filter: `
        ?process oph:procesGroep ?processGroupUri .
        ${sparqlFilters.group}
        `,
    },
  ]
    .filter((f) => f.use)
    .map((f) => f.filter)
    .join(' ');
  const queryResult = await query(`
    PREFIX oph: <http://lblod.data.gift/vocabularies/openproceshuis/>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT (COUNT(DISTINCT ?process) as ?count)
    WHERE {
      ?process a oph:ConceptueelProces .
      ?process mu:uuid ?id .
      OPTIONAl {
        ?process adms:status ?status .
      }
      BIND(IF(BOUND(?status), ?status,  <http://lblod.data.gift/concepts/concept-status/canShowInOPH>) as ?safeStatus) # magic url
      FILTER(?safeStatus != <http://lblod.data.gift/concepts/concept-status/gearchiveerd>)
        
      ${filterString}
    }
  `);

  const countAsString = queryResult.results.bindings[0]?.count?.value ?? '0';

  return parseInt(countAsString);
}
