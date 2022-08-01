import React from "react";
import Typography from "@material-ui/core/Typography";
import { DescriptionFieldProps } from "@rjsf/utils";

const DescriptionField = ({ description }: DescriptionFieldProps) => {
  if (description) {
    return (
      <Typography variant="subtitle2" style={{ marginTop: "5px" }}>
        {description}
      </Typography>
    );
  }

  return null;
};

export default DescriptionField;
