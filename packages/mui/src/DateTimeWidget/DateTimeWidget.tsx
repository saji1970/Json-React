import React from "react";
import { localToUTC, utcToLocal, WidgetProps } from "@rjsf/utils";

const DateTimeWidget = (props: WidgetProps) => {
  const { registry } = props;
  const { TextWidget } = registry.widgets;
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
