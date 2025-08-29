import { query } from 'mu';

export async function getTotalCountOfConceptionalProcesses() {
  const queryResult = await query(`
    PREFIX oph: <http://lblod.data.gift/vocabularies/openproceshuis/>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>

    SELECT (COUNT(DISTINCT ?process) as ?count)
    WHERE {
      ?process a oph:ConceptueelProces .
      ?process mu:uuid ?id .
      OPTIONAL {
        ?process adms:status ?status .
        FILTER(?status != <http://lblod.data.gift/concepts/concept-status/gearchiveerd>)
      }
    }
  `);

  const countAsString = queryResult.results.bindings[0]?.count?.value ?? '0';

  return parseInt(countAsString);
}
