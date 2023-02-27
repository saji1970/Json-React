/** Potentially substitutes all replaceable parameters with the associated value(s) from the `params` if available. When
 * a `params` array is provided, each value in the array is used to replace any of the replaceable parameters in the
 * `inputString` using the `%1`, `%2`, etc. replacement specifiers.
 *
 * @param inputString - The string which will be potentially updated with replacement parameters
 * @param params - The optional list of replaceable parameter values to substitute into the english string
 * @returns - The updated string with any replacement specifiers replaced
 */
export default function replaceStringParameters(
  inputString: string,
  params?: string[]
) {
  let output = inputString;
  if (Array.isArray(params)) {
    params.forEach((param, index) => {
      output = output.replace(`%${index + 1}`, param);
    });
  }
  return output;
}
