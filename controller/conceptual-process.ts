import { query } from 'mu';
import { jsonToCsv, queryResultToJson } from '../util/json-to-csv';

export async function getConceptualProcessExport() {
  const content = await getTableContent();

  return await jsonToCsv(content);
}

async function getTableContent() {
  const queryResult = await query(`
    PREFIX oph: <http://lblod.data.gift/vocabularies/openproceshuis/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX adms: <http://www.w3.org/ns/adms#>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>

    SELECT DISTINCT ?process ?identifierNumber
                    (GROUP_CONCAT(DISTINCT ?category; SEPARATOR=" / ") AS ?categories)
                    (GROUP_CONCAT(DISTINCT ?processDomain; SEPARATOR=" / ") AS ?processDomains)
                    (GROUP_CONCAT(DISTINCT ?processGroup; SEPARATOR=" / ") AS ?processGroups)
                    (GROUP_CONCAT(DISTINCT ?mainProcess; SEPARATOR=" / ") AS ?mainProcesses)
    WHERE {
      ?process a oph:ConceptueelProces .
      OPTIONAL {
        ?process oph:procesGroep / skos:relatedMatch / skos:relatedMatch ?category .
      }
      OPTIONAL {
        ?process oph:procesGroep / skos:relatedMatch / skos:prefLabel ?processDomain .
      }
      OPTIONAL {
        ?process oph:procesGroep / skos:prefLabel ?processGroup .
      }
      OPTIONAL {
        ?process oph:procesGroep / skos:relatedMatch / skos:relatedMatch / skos:prefLabel ?mainProcess .
      }
      OPTIONAL {
      ?process dct:identifier ?identifierNumber .
      }
    }
  `);
  const varLabelMap = {
    process: 'Uri',
    categories: 'Categorie',
    processDomains: 'Proces domein',
    processGroups: 'Proces groep',
    mainProcesses: 'Hoofd proces',
    identifierNumber: 'Number',
  };

  return queryResultToJson(queryResult, varLabelMap);
}
