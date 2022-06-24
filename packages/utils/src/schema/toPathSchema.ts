import get from 'lodash/get';
import set from 'lodash/set';

import {
  ALL_OF_KEY,
  ADDITIONAL_PROPERTIES_KEY,
  DEPENDENCIES_KEY,
  ITEMS_KEY,
  PROPERTIES_KEY,
  REF_KEY,
} from '../constants';
import { PathSchema, RJSFSchema, ValidatorType } from '../types';
import retrieveSchema from './retrieveSchema';

/** Generates an `PathSchema` object for the `schema`, recursively
 *
 * @param validator - An implementation of the `ValidatorType` interface that will be used when necessary
 * @param schema - The schema for which the `PathSchema` is desired
 * @param [name=''] - The base name for the schema
 * @param [rootSchema] - The root schema, used to primarily to look up `$ref`s
 * @param [formData] - The current formData, if any, to assist retrieving a schema
 * @returns - The `PathSchema` object for the `schema`
 */
export default function toPathSchema<T = any>(
  validator: ValidatorType,
  schema: RJSFSchema,
  name = '',
  rootSchema?: RJSFSchema,
  formData?: T
): PathSchema<T> {
  if (REF_KEY in schema || DEPENDENCIES_KEY in schema || ALL_OF_KEY in schema) {
    const _schema = retrieveSchema<T>(validator, schema, rootSchema, formData);
    return toPathSchema<T>(validator, _schema, name, rootSchema, formData);
  }

  const pathSchema: PathSchema = {
    $name: name.replace(/^\./, ''),
  } as PathSchema;

  if (schema.hasOwnProperty(ADDITIONAL_PROPERTIES_KEY)) {
    set(pathSchema, '__rjsf_additionalProperties', true);
  }

  if (schema.hasOwnProperty(ITEMS_KEY) && Array.isArray(formData)) {
    formData.forEach((element, i: number) => {
      pathSchema[i] = toPathSchema<T>(
        validator,
        schema.items as RJSFSchema,
        `${name}.${i}`,
        rootSchema,
        element
      );
    });
  } else if (schema.hasOwnProperty(PROPERTIES_KEY)) {
    for (const property in schema.properties) {
      const field = get(schema, [PROPERTIES_KEY, property]);
      pathSchema[property] = toPathSchema<T>(
        validator,
        field,
        `${name}.${property}`,
        rootSchema,
        // It's possible that formData is not an object -- this can happen if an
        // array item has just been added, but not populated with data yet
        get(formData, [property])
      );
    }
  }
  return pathSchema as PathSchema<T>;
}
