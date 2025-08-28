import { json2csv } from 'json-2-csv';
import { HttpError } from './http-error';

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

export function queryResultToJson(queryResult, varLabelMap) {
  const bindings = queryResult.results.bindings;
  const headers = Object.keys(varLabelMap);

  return bindings.map((binding) => {
    const unpacked = {};
    for (const headerKey of headers) {
      let key = headerKey;
      if (key in varLabelMap) {
        key = varLabelMap[key];
      }

      unpacked[key] = binding[headerKey] ? binding[headerKey].value : '';
    }
    return unpacked;
  });
}
