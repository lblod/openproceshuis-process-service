import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString } from 'mu';
import { queryResultToJson } from '../util/json-to-csv';

export async function getOrganizationsUsingProcess(
  processId: string,
): Promise<Array<{ id: string; label: string; type: string }>> {
  const queryResult = await querySudo(`
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX org: <http://www.w3.org/ns/org#>

    SELECT DISTINCT ?id ?label ?type
    WHERE {
      VALUES ?id { ${sparqlEscapeString(processId)} }
      ?process mu:uuid ?id.
      ?process dct:publisher ?self .
      ?process prov:usedBy ?organization .
      ?organization skos:prefLabel ?label .
      ?organization org:classification / skos:prefLabel ?type .
    }
  `);

  return queryResultToJson(queryResult);
}
