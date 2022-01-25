import React from "react";
import { getSubmitButtonOptions } from ".././../utils";

export default function SubmitButton({ uiSchema }) {
  const {
    submitText,
    removed,
    props: submitButtonProps,
  } = getSubmitButtonOptions(uiSchema);
  return (
    <div>
      {!removed && (
        <button type="submit" {...submitButtonProps}>
          {submitText}
        </button>
      )}
    </div>
  );
}
