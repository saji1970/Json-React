import * as React from "react";
import { schemaRequiresTrueValue } from "@rjsf/utils";
import { WidgetProps } from "@rjsf/utils";

/** The `CheckBoxWidget` is a widget for rendering boolean properties.
 *  It is typically used to represent a boolean.
 *
 * @param props - The `WidgetProps` for this component
 */
function CheckboxWidget<T = any, F = any>({
  schema,
  id,
  value,
  disabled,
  readonly,
  label,
  autofocus = false,
  onBlur,
  onFocus,
  onChange,
  registry,
}: WidgetProps<T, F>) {
  const { DescriptionFieldTemplate } = registry.templates;
  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue(schema);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange(event.target.checked);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, event.target.checked);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) =>
    onFocus(id, event.target.checked);

  return (
    <div className={`checkbox ${disabled || readonly ? "disabled" : ""}`}>
      {schema.description && (
        <DescriptionFieldTemplate
          id={id + "__description"}
          description={schema.description}
          registry={registry}
        />
      )}
      <label>
        <input
          type="checkbox"
          id={id}
          checked={typeof value === "undefined" ? false : value}
          required={required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
        />
        <span>{label}</span>
      </label>
    </div>
  );
}

export default CheckboxWidget;
