import React from "react";
import {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
} from "@rjsf/utils";
import Button from "react-bootstrap/Button";
import { BsPlus } from "@react-icons/all-files/bs/BsPlus";

export default function AddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ uiSchema, registry, ...props }: IconButtonProps<T, S, F>) {
  return (
    <Button
      {...props}
      style={{ width: "100%" }}
      className={`ml-1 ${props.className}`}
      title="Add Item"
    >
      <BsPlus />
    </Button>
  );
}
