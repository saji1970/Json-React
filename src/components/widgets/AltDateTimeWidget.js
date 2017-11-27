import React from "react";
import PropTypes from "prop-types";

import { registryShape } from "../../types";

function AltDateTimeWidget(props) {
  const { AltDateWidget } = props.registry.widgets;
  return <AltDateWidget time {...props} />;
}

if (process.env.NODE_ENV !== "production") {
  AltDateTimeWidget.propTypes = {
    registry: registryShape.isRequired,
    schema: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    required: PropTypes.bool,
    onChange: PropTypes.func,
  };
}

export default AltDateTimeWidget;
