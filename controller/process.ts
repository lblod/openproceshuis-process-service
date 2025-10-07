import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeString } from 'mu';

export async function getProcessUsageCountOverOrganizations(processId: string) {
  const queryResult = await querySudo(`
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX prov: <http://www.w3.org/ns/prov#>
    PREFIX dct: <http://purl.org/dc/terms/>

    SELECT DISTINCT ?organization
    WHERE {
      ?process mu:uuid ${sparqlEscapeString(processId)}.
      ?process dct:publisher ?self .
      ?process prov:usedBy ?organization .
    }
  `);

  return queryResult.results?.bindings?.length ?? 0;
}
