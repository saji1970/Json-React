import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import {
  ANY_OF_KEY,
  DEFAULT_KEY,
  DEPENDENCIES_KEY,
  PROPERTIES_KEY,
  ONE_OF_KEY,
  REF_KEY,
  DefaultFormStateBehavior,
} from '../constants';
import findSchemaDefinition from '../findSchemaDefinition';
import getClosestMatchingOption from './getClosestMatchingOption';
import getDiscriminatorFieldFromSchema from '../getDiscriminatorFieldFromSchema';
import getSchemaType from '../getSchemaType';
import isObject from '../isObject';
import isFixedItems from '../isFixedItems';
import mergeDefaultsWithFormData from '../mergeDefaultsWithFormData';
import mergeObjects from '../mergeObjects';
import { FormContextType, GenericObjectType, RJSFSchema, StrictRJSFSchema, ValidatorType } from '../types';
import isMultiSelect from './isMultiSelect';
import retrieveSchema, { resolveDependencies } from './retrieveSchema';

/** Enum that indicates how `schema.additionalItems` should be handled by the `getInnerSchemaForArrayItem()` function.
 */
export enum AdditionalItemsHandling {
  Ignore,
  Invert,
  Fallback,
}

/** Given a `schema` will return an inner schema that for an array item. This is computed differently based on the
 * `additionalItems` enum and the value of `idx`. There are four possible returns:
 * 1. If `idx` is >= 0, then if `schema.items` is an array the `idx`th element of the array is returned if it is a valid
 *    index and not a boolean, otherwise it falls through to 3.
 * 2. If `schema.items` is not an array AND truthy and not a boolean, then `schema.items` is returned since it actually
 *    is a schema, otherwise it falls through to 3.
 * 3. If `additionalItems` is not `AdditionalItemsHandling.Ignore` and `schema.additionalItems` is an object, then
 *    `schema.additionalItems` is returned since it actually is a schema, otherwise it falls through to 4.
 * 4. {} is returned representing an empty schema
 *
 * @param schema - The schema from which to get the particular item
 * @param [additionalItems=AdditionalItemsHandling.Ignore] - How do we want to handle additional items?
 * @param [idx=-1] - Index, if non-negative, will be used to return the idx-th element in a `schema.items` array
 * @returns - The best fit schema object from the `schema` given the `additionalItems` and `idx` modifiers
 */
export function getInnerSchemaForArrayItem<S extends StrictRJSFSchema = RJSFSchema>(
  schema: S,
  additionalItems: AdditionalItemsHandling = AdditionalItemsHandling.Ignore,
  idx = -1
): S {
  if (idx >= 0) {
    if (Array.isArray(schema.items) && idx < schema.items.length) {
      const item = schema.items[idx];
      if (typeof item !== 'boolean') {
        return item as S;
      }
    }
  } else if (schema.items && !Array.isArray(schema.items) && typeof schema.items !== 'boolean') {
    return schema.items as S;
  }
  if (additionalItems !== AdditionalItemsHandling.Ignore && isObject(schema.additionalItems)) {
    return schema.additionalItems as S;
  }
  return {} as S;
}

/** Either add `computedDefault` at `key` into `obj` or not add it based on its value and the value of
 * `includeUndefinedValues`. Generally undefined `computedDefault` values are added only when `includeUndefinedValues`
 * is either true or "excludeObjectChildren". If `includeUndefinedValues` is false, then non-undefined and
 * non-empty-object values will be added.
 *
 * @param obj - The object into which the computed default may be added
 * @param key - The key into the object at which the computed default may be added
 * @param computedDefault - The computed default value that maybe should be added to the obj
 * @param includeUndefinedValues - Optional flag, if true, cause undefined values to be added as defaults.
 *          If "excludeObjectChildren", cause undefined values for this object and pass `includeUndefinedValues` as
 *          false when computing defaults for any nested object properties. If "allowEmptyObject", prevents undefined
 *          values in this object while allow the object itself to be empty and passing `includeUndefinedValues` as
 *          false when computing defaults for any nested object properties.
 * @param requiredFields - The list of fields that are required
 */
function maybeAddDefaultToObject<T = any>(
  obj: GenericObjectType,
  key: string,
  computedDefault: T | T[] | undefined,
  includeUndefinedValues: boolean | 'excludeObjectChildren',
  requiredFields: string[] = []
) {
  if (includeUndefinedValues) {
    obj[key] = computedDefault;
  } else if (isObject(computedDefault)) {
    // Store computedDefault if it's a non-empty object (e.g. not {})
    if (!isEmpty(computedDefault) || requiredFields.includes(key)) {
      obj[key] = computedDefault;
    }
  } else if (computedDefault !== undefined) {
    // Store computedDefault if it's a defined primitive (e.g. true)
    obj[key] = computedDefault;
  }
}

interface computeDefaultsProps<T = any, S extends StrictRJSFSchema = RJSFSchema> {
  parentDefaults?: T;
  rootSchema?: S;
  rawFormData?: T;
  includeUndefinedValues?: boolean | 'excludeObjectChildren';
  _recurseList?: string[];
  defaultFormStateBehavior?: number;
  required?: boolean;
}

/** Computes the defaults for the current `schema` given the `rawFormData` and `parentDefaults` if any. This drills into
 * each level of the schema, recursively, to fill out every level of defaults provided by the schema.
 *
 * @param validator - an implementation of the `ValidatorType` interface that will be used when necessary
 * @param rawSchema - The schema for which the default state is desired
 * @param [props] - Optional props for this function
 * @param [props.parentDefaults] - Any defaults provided by the parent field in the schema
 * @param [props.rootSchema] - The options root schema, used to primarily to look up `$ref`s
 * @param [props.rawFormData] - The current formData, if any, onto which to provide any missing defaults
 * @param [props.includeUndefinedValues=false] - Optional flag, if true, cause undefined values to be added as defaults.
 *          If "excludeObjectChildren", cause undefined values for this object and pass `includeUndefinedValues` as
 *          false when computing defaults for any nested object properties.
 * @param [props._recurseList=[]] - The list of ref names currently being recursed, used to prevent infinite recursion
 * @param [props.defaultFormStateBehavior=0] - Optional bit flag, if provided, allows users to override default form state behavior
 * @param [props.required] - Optional flag, if true, indicates this schema was required in the parent schema.
 * @returns - The resulting `formData` with all the defaults provided
 */
export function computeDefaults<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  validator: ValidatorType<T, S, F>,
  rawSchema: S,
  {
    parentDefaults,
    rawFormData,
    rootSchema = {} as S,
    includeUndefinedValues = false,
    _recurseList = [],
    defaultFormStateBehavior = 0,
    required = false,
  }: computeDefaultsProps<T, S> = {}
): T | T[] | undefined {
  const formData: T = (isObject(rawFormData) ? rawFormData : {}) as T;
  let schema: S = isObject(rawSchema) ? rawSchema : ({} as S);
  // Compute the defaults recursively: give highest priority to deepest nodes.
  let defaults: T | T[] | undefined = parentDefaults;
  if (isObject(defaults) && isObject(schema.default)) {
    // For object defaults, only override parent defaults that are defined in
    // schema.default.
    defaults = mergeObjects(defaults!, schema.default as GenericObjectType) as T;
  } else if (DEFAULT_KEY in schema) {
    defaults = schema.default as unknown as T;
  } else if (REF_KEY in schema) {
    const refName = schema[REF_KEY];
    // Use referenced schema defaults for this node.
    if (!_recurseList.includes(refName!)) {
      const refSchema = findSchemaDefinition<S>(refName, rootSchema);
      return computeDefaults<T, S, F>(validator, refSchema, {
        rootSchema,
        includeUndefinedValues,
        _recurseList: _recurseList.concat(refName!),
        defaultFormStateBehavior,
        parentDefaults: defaults,
        rawFormData: formData as T,
      });
    }
  } else if (DEPENDENCIES_KEY in schema) {
    const resolvedSchema = resolveDependencies<T, S, F>(validator, schema, rootSchema, false, formData);
    return computeDefaults<T, S, F>(
      validator,
      resolvedSchema[0],
      {
        rootSchema,
        includeUndefinedValues,
        _recurseList,
        defaultFormStateBehavior,
        parentDefaults: defaults,
        rawFormData: formData as T,
      },
    );
  } else if (isFixedItems(schema)) {
    defaults = (schema.items! as S[]).map((itemSchema: S, idx: number) =>
      computeDefaults<T, S>(validator, itemSchema, {
        rootSchema,
        includeUndefinedValues,
        _recurseList,
        defaultFormStateBehavior,
        parentDefaults: Array.isArray(parentDefaults) ? parentDefaults[idx] : undefined,
        rawFormData: formData as T,
      })
    ) as T[];
  } else if (ONE_OF_KEY in schema) {
    if (schema.oneOf!.length === 0) {
      return undefined;
    }
    const discriminator = getDiscriminatorFieldFromSchema<S>(schema);
    schema = schema.oneOf![
      getClosestMatchingOption<T, S, F>(
        validator,
        rootSchema,
        isEmpty(formData) ? undefined : formData,
        schema.oneOf as S[],
        0,
        discriminator
      )
    ] as S;
  } else if (ANY_OF_KEY in schema) {
    if (schema.anyOf!.length === 0) {
      return undefined;
    }
    const discriminator = getDiscriminatorFieldFromSchema<S>(schema);
    schema = schema.anyOf![
      getClosestMatchingOption<T, S, F>(
        validator,
        rootSchema,
        isEmpty(formData) ? undefined : formData,
        schema.anyOf as S[],
        0,
        discriminator
      )
    ] as S;
  }

  // No defaults defined for this node, fallback to generic typed ones.
  if (defaults === undefined) {
    defaults = schema.default as unknown as T;
  }

  switch (getSchemaType<S>(schema)) {
    // We need to recurse for object schema inner default values.
    case 'object': {
      const objectDefaults = Object.keys(schema.properties || {}).reduce((acc: GenericObjectType, key: string) => {
        // Compute the defaults for this node, with the parent defaults we might
        // have from a previous run: defaults[key].
        const computedDefault = computeDefaults<T, S, F>(validator, get(schema, [PROPERTIES_KEY, key]), {
          rootSchema,
          _recurseList,
          defaultFormStateBehavior,
          includeUndefinedValues: includeUndefinedValues === true,
          parentDefaults: get(defaults, [key]),
          rawFormData: get(formData, [key]),
          required: schema.required?.includes(key),
        });
        maybeAddDefaultToObject<T>(acc, key, computedDefault, includeUndefinedValues, schema.required);
        return acc;
      }, {}) as T;
      if (schema.additionalProperties) {
        // as per spec additionalProperties may be either schema or boolean
        const additionalPropertiesSchema = isObject(schema.additionalProperties) ? schema.additionalProperties : {};
        const keys = new Set<string>();
        if (isObject(defaults)) {
          Object.keys(defaults as GenericObjectType)
            .filter((key) => !schema.properties || !schema.properties[key])
            .forEach((key) => keys.add(key));
        }
        if (isObject(formData)) {
          Object.keys(formData as GenericObjectType)
            .filter((key) => !schema.properties || !schema.properties[key])
            .forEach((key) => keys.add(key));
        }
        keys.forEach((key) => {
          const computedDefault = computeDefaults(validator, additionalPropertiesSchema as S, {
            rootSchema,
            _recurseList,
            defaultFormStateBehavior,
            includeUndefinedValues: includeUndefinedValues === true,
            parentDefaults: get(defaults, [key]),
            rawFormData: get(formData, [key]),
            required: schema.required?.includes(key),
          });
          maybeAddDefaultToObject<T>(objectDefaults as GenericObjectType, key, computedDefault, includeUndefinedValues);
        });
      }
      return objectDefaults;
    }
    case 'array': {
      // Inject defaults into existing array defaults
      if (Array.isArray(defaults)) {
        defaults = defaults.map((item, idx) => {
          const schemaItem: S = getInnerSchemaForArrayItem<S>(schema, AdditionalItemsHandling.Fallback, idx);
          return computeDefaults<T, S, F>(validator, schemaItem, {
            rootSchema,
            _recurseList,
            defaultFormStateBehavior,
            parentDefaults: item,
          });
        }) as T[];
      }

      // Deeply inject defaults into already existing form data
      if (Array.isArray(rawFormData)) {
        const schemaItem: S = getInnerSchemaForArrayItem<S>(schema);
        defaults = rawFormData.map((item: T, idx: number) => {
          return computeDefaults<T, S, F>(validator, schemaItem, {
            rootSchema,
            _recurseList,
            defaultFormStateBehavior,
            rawFormData: item,
            parentDefaults: get(defaults, [idx]),
          });
        }) as T[];
      }

      const ignoreMinItemsFlagSet =
        (defaultFormStateBehavior & DefaultFormStateBehavior.IgnoreMinItemsUnlessRequired) ===
        DefaultFormStateBehavior.IgnoreMinItemsUnlessRequired;

      if (ignoreMinItemsFlagSet && !required) {
        // If no form data exists or defaults are set leave the field empty/non-existent, otherwise
        // return form data/defaults
        return defaults ? defaults : undefined;
      }

      const defaultsLength = Array.isArray(defaults) ? defaults.length : 0;
      if (
        !schema.minItems ||
        isMultiSelect<T, S, F>(validator, schema, rootSchema) ||
        schema.minItems <= defaultsLength
      ) {
        return defaults ? defaults : [];
      }

      const defaultEntries: T[] = (defaults || []) as T[];
      const fillerSchema: S = getInnerSchemaForArrayItem<S>(schema, AdditionalItemsHandling.Invert);
      const fillerDefault = fillerSchema.default;

      // Calculate filler entries for remaining items (minItems - existing raw data/defaults)
      const fillerEntries: T[] = new Array(schema.minItems - defaultsLength).fill(
        computeDefaults<any, S, F>(validator, fillerSchema, {
          parentDefaults: fillerDefault,
          rootSchema,
          _recurseList,
          defaultFormStateBehavior,
        })
      ) as T[];
      // then fill up the rest with either the item default or empty, up to minItems
      return defaultEntries.concat(fillerEntries);
    }
  }

  return defaults;
}

/** Returns the superset of `formData` that includes the given set updated to include any missing fields that have
 * computed to have defaults provided in the `schema`.
 *
 * @param validator - An implementation of the `ValidatorType` interface that will be used when necessary
 * @param theSchema - The schema for which the default state is desired
 * @param [formData] - The current formData, if any, onto which to provide any missing defaults
 * @param [rootSchema] - The root schema, used to primarily to look up `$ref`s
 * @param [includeUndefinedValues=false] - Optional flag, if true, cause undefined values to be added as defaults.
 *          If "excludeObjectChildren", cause undefined values for this object and pass `includeUndefinedValues` as
 *          false when computing defaults for any nested object properties.
 * @param [defaultFormStateBehavior=0] Optional bit flag, if provided, allows users to override default form state behavior
 * @returns - The resulting `formData` with all the defaults provided
 */
export default function getDefaultFormState<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(
  validator: ValidatorType<T, S, F>,
  theSchema: S,
  formData?: T,
  rootSchema?: S,
  includeUndefinedValues: boolean | 'excludeObjectChildren' = false,
  defaultFormStateBehavior = 0
) {
  if (!isObject(theSchema)) {
    throw new Error('Invalid schema: ' + theSchema);
  }
  const schema = retrieveSchema<T, S, F>(validator, theSchema, rootSchema, formData);
  const defaults = computeDefaults<T, S, F>(validator, schema, {
    rootSchema,
    includeUndefinedValues,
    defaultFormStateBehavior,
    rawFormData: formData,
  });
  if (formData === undefined || formData === null || (typeof formData === 'number' && isNaN(formData))) {
    // No form data? Use schema defaults.
    return defaults;
  }
  if (isObject(formData)) {
    return mergeDefaultsWithFormData<T>(defaults as T, formData);
  }
  if (Array.isArray(formData)) {
    return mergeDefaultsWithFormData<T[]>(defaults as T[], formData);
  }
  return formData;
}
