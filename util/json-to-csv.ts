import { json2csv } from 'json-2-csv';
import { HttpError } from './http-error';
import { Literal } from 'rdflib';

export async function jsonToCsv(jsonArray) {
  if (!jsonArray || jsonArray.length === 0) {
    return '';
  }

  let csvString = '';
  try {
    csvString = await json2csv(jsonArray);
  } catch (error) {
    throw new HttpError(
      'Something went wrong while parsing json to a csv string.',
      500,
    );
  }

  return csvString;
}

export function queryResultToJson(queryResult) {
  const bindings = queryResult.results.bindings;
  const headers = queryResult.head.vars;

  return bindings.map((binding) => {
    const unpacked = {};
    for (const headerKey of headers) {
      const term = binding[headerKey];
      if (!term) {
        unpacked[headerKey] = null;
        return;
      }
      const literal = new Literal(term.value, term.lang, term.datatype);
      unpacked[headerKey] = Literal.toJS(literal);
    }
    return unpacked;
  });
}
