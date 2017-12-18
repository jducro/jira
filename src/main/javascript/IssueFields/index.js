import { FieldUtils } from './FieldUtils';

export { IssueFieldMapper } from './IssueFieldMapper';
export { FieldUtils }

/**
 * @param issue
 * @param {Array<Object>} fields
 * @return {{}}
 */
export function fieldValues(issue, fields)
{
  const values = {};
  for (const field of fields) {
    values[field.key] = JSON.parse(JSON.stringify(issue.fields[field.key]));
  }
  console.log('these are the values ', values, issue, fields);
  return values;
}

