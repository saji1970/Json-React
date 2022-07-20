import React from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";

import { canExpand, getUiOptions, ObjectFieldTemplateProps } from "@rjsf/utils";

import AddButton from "../AddButton/AddButton";

const ObjectFieldTemplate = ({
  DescriptionField,
  description,
  TitleField,
  title,
  properties,
  required,
  uiSchema,
  idSchema,
  schema,
  formData,
  onAddClick,
  disabled,
  readonly,
}: ObjectFieldTemplateProps) => {
  const uiOptions = getUiOptions(uiSchema);
  return (
    <>
      {(uiOptions.title || title) && (
        <TitleField
          id={`${idSchema.$id}-title`}
          title={uiOptions.title || title}
          required={required}
        />
      )}
      {description && (
        <DescriptionField
          id={`${idSchema.$id}-description`}
          description={description}
        />
      )}
      <Container fluid className="p-0">
        {properties.map((element: any, index: number) => (
          <Row
            key={index}
            style={{ marginBottom: "10px" }}
            className={element.hidden ? "d-none" : undefined}
          >
            <Col xs={12}> {element.content}</Col>
          </Row>
        ))}
        {canExpand(schema, uiSchema, formData) ? (
          <Row>
            <Col xs={{ offset: 9, span: 3 }} className="py-4">
              <AddButton
                onClick={onAddClick(schema)}
                disabled={disabled || readonly}
                className="object-property-expand"
              />
            </Col>
          </Row>
        ) : null}
      </Container>
    </>
  );
};

export default ObjectFieldTemplate;
