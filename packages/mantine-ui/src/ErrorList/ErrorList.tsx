import { Box, List, Title } from '@mantine/core';
import { ErrorListProps, FormContextType, RJSFSchema, StrictRJSFSchema, TranslatableString } from '@rjsf/utils';

/** The `ErrorList` component is the template that renders the all the errors associated with the fields in the `Form`
 *
 * @param props - The `ErrorListProps` for this component
 */
export default function ErrorList<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  errors,
  registry,
}: ErrorListProps<T, S, F>) {
  const { translateString } = registry;
  return (
    <Box>
      <Title order={5}>{translateString(TranslatableString.ErrorsLabel)}</Title>
      <List>
        {errors.map((error, index) => (
          <List.Item key={`error-${index}`}>{error.stack}</List.Item>
        ))}
      </List>
    </Box>
  );
}
