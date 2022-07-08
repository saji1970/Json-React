import { createSchemaUtils, WidgetProps, RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv6";

import TextWidget from "../../src/TextWidget/TextWidget";

export const mockSchema: RJSFSchema = {
  type: "array",
  items: {
    type: "string",
  },
};

export const mockEventHandlers = (): void => void 0;

export const mockSchemaUtils = createSchemaUtils(validator, mockSchema);

export function makeWidgetMockProps(
  props: Partial<WidgetProps> = {}
): WidgetProps {
  return {
    uiSchema: {},
    schema: mockSchema,
    required: true,
    disabled: false,
    readonly: true,
    autofocus: true,
    label: "Some simple label",
    onChange: mockEventHandlers,
    onBlur: mockEventHandlers,
    onFocus: mockEventHandlers,
    multiple: false,
    rawErrors: [""],
    value: "value",
    options: {},
    formContext: {},
    id: "_id",
    placeholder: "",
    registry: {
      fields: {},
      widgets: { TextWidget },
      formContext: {},
      rootSchema: {},
      schemaUtils: mockSchemaUtils,
    },
    ...props,
  };
}
