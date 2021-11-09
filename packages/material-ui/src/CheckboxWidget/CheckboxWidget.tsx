import React from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { FormHelperText } from "@material-ui/core";

import { WidgetProps } from "@visma/rjsf-core";
import { utils } from "@visma/rjsf-core";
import FormControl from '@material-ui/core/FormControl';

const { schemaRequiresTrueValue } = utils;

const CheckboxWidget = (props: WidgetProps) => {
  const {
    schema,
    id,
    value,
    disabled,
    readonly,
    label,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    options
  } = props;

  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue(schema);

  const _onChange = ({}, checked: boolean) => onChange(checked);
  const _onBlur = ({
    target: { value },
  }: React.FocusEvent<HTMLButtonElement>) => onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLButtonElement>) => onFocus(id, value);

  return (
    <FormControl component="fieldset">
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            checked={typeof value === "undefined" ? false : value}
            required={required}
            disabled={disabled || readonly}
            autoFocus={autofocus}
            onChange={_onChange}
            onBlur={_onBlur}
            onFocus={_onFocus}
          />
        }
        label={label}
      />
      {options.description && <FormHelperText>{options.description}</FormHelperText>}
    </FormControl>
  );
};

export default CheckboxWidget;
