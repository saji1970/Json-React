import React from "react";
import { utils } from "@visma/rjsf-core";
import TextWidget, { TextWidgetProps } from "../TextWidget";

const { localToUTC, utcToLocal } = utils;

const DateTimeWidget = (props: TextWidgetProps) => {
  const value = utcToLocal(props.value);
  const onChange = (value: any) => {
    props.onChange(localToUTC(value));
  };

  return (
    <TextWidget
      type="datetime-local"
      InputLabelProps={{
        shrink: true,
      }}
      {...props}
      value={value}
      onChange={onChange}
    />
  );
};

export default DateTimeWidget;
