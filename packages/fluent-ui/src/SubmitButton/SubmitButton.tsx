import React from "react";
import { utils, WidgetProps } from '@rjsf/core';
import { PrimaryButton } from "@fluentui/react";
const { getSubmitButtonProps } = utils;
export default ({uiSchema}: WidgetProps) => {
  const { submitText, required, ...submitButtonProps }= getSubmitButtonProps(uiSchema);
  if(!required) return null;
  return (
    <div>
      <br />
      <div className="ms-Grid-col ms-sm12">
        <PrimaryButton text={submitText} type="submit" {...submitButtonProps} />
      </div>
    </div>
  );
};
