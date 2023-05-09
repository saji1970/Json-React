import fs from 'fs';
import standaloneCode from 'ajv/dist/standalone';
import { RJSFSchema, StrictRJSFSchema, schemaParser } from '@rjsf/utils';

import createAjvInstance from './createAjvInstance';
import { CustomValidatorOptionsType } from './types';

/** The function used to compile a schema into an output file in the form that allows it to be used as a precompiled
 * validator. The main reasons for using a precompiled validator is reducing code size, improving validation speed and,
 * most importantly, avoiding dynamic code compilation when prohibited by a browser's Content Security Policy. For more
 * information about AJV code compilation see: https://ajv.js.org/standalone.html
 *
 * @param schema - The schema to be compiled into a set of precompiled validators functions
 * @param output - The name of the file into which the precompiled validator functions will be generated
 * @param [options={}] - The set of `CustomValidatorOptionsType` information used to alter the AJV validator used for
 *        compiling the schema. They are the same options that are passed to the `customizeValidator()` function in
 *        order to modify the behavior of the regular AJV-based validator.
 */
export default function compileSchemaValidators<S extends StrictRJSFSchema = RJSFSchema>(
  schema: S,
  output: string,
  options: CustomValidatorOptionsType = {}
) {
  console.log('parsing the schema');
  const schemaMaps = schemaParser(schema);
  const schemas = Object.values(schemaMaps);

  const { additionalMetaSchemas, customFormats, ajvOptionsOverrides = {}, ajvFormatOptions, AjvClass } = options;
  const compileOptions = { ...ajvOptionsOverrides, code: { source: true, lines: true }, schemas };
  const ajv = createAjvInstance(additionalMetaSchemas, customFormats, compileOptions, ajvFormatOptions, AjvClass);

  const moduleCode = standaloneCode(ajv);
  console.log(`writing ${output}`);
  fs.writeFileSync(output, moduleCode);
}
