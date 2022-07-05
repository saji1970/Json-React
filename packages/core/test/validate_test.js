import React from "react";
import { expect } from "chai";
import sinon from "sinon";
import { Simulate } from "react-dom/test-utils";

import { createFormComponent, submitForm } from "./test_utils";
import { customizeValidator } from "@rjsf/validator-ajv6";

describe("Validation", () => {
  describe("Form integration", () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe("JSONSchema validation", () => {
      describe("Required fields", () => {
        const schema = {
          type: "object",
          required: ["foo"],
          properties: {
            foo: { type: "string" },
            bar: { type: "string" },
          },
        };

        let onError, node;
        beforeEach(() => {
          const compInfo = createFormComponent({
            schema,
            formData: {
              foo: undefined,
            },
          });
          onError = compInfo.onError;
          node = compInfo.node;
          submitForm(node);
        });

        it("should trigger onError call", () => {
          sinon.assert.calledWithMatch(onError.lastCall, [
            {
              message: "is a required property",
              name: "required",
              params: { missingProperty: "foo" },
              property: ".foo",
              schemaPath: "#/required",
              stack: ".foo is a required property",
            },
          ]);
        });

        it("should render errors", () => {
          expect(node.querySelectorAll(".errors li")).to.have.length.of(1);
          expect(node.querySelector(".errors li").textContent).eql(
            ".foo is a required property"
          );
        });
      });

      describe("Min length", () => {
        const schema = {
          type: "object",
          required: ["foo"],
          properties: {
            foo: {
              type: "string",
              minLength: 10,
            },
          },
        };

        let node, onError;

        beforeEach(() => {
          onError = sandbox.spy();
          const compInfo = createFormComponent({
            schema,
            formData: {
              foo: "123456789",
            },
            onError,
          });
          node = compInfo.node;

          submitForm(node);
        });

        it("should render errors", () => {
          expect(node.querySelectorAll(".errors li")).to.have.length.of(1);
          expect(node.querySelector(".errors li").textContent).eql(
            ".foo should NOT be shorter than 10 characters"
          );
        });

        it("should trigger the onError handler", () => {
          sinon.assert.calledWithMatch(onError.lastCall, [
            {
              message: "should NOT be shorter than 10 characters",
              name: "minLength",
              params: { limit: 10 },
              property: ".foo",
              schemaPath: "#/properties/foo/minLength",
              stack: ".foo should NOT be shorter than 10 characters",
            },
          ]);
        });
      });
    });

    describe("Custom Form validation", () => {
      it("should validate a simple string value", () => {
        const schema = { type: "string" };
        const formData = "a";

        function validate(formData, errors) {
          if (formData !== "hello") {
            errors.addError("Invalid");
          }
          return errors;
        }

        const { onError, node } = createFormComponent({
          schema,
          validate,
          formData,
        });

        submitForm(node);
        sinon.assert.calledWithMatch(onError.lastCall, [
          { stack: "root: Invalid" },
        ]);
      });

      it("should live validate a simple string value when liveValidate is set to true", () => {
        const schema = { type: "string" };
        const formData = "a";

        function validate(formData, errors) {
          if (formData !== "hello") {
            errors.addError("Invalid");
          }
          return errors;
        }

        const { onChange, node } = createFormComponent({
          schema,
          validate,
          formData,
          liveValidate: true,
        });
        Simulate.change(node.querySelector("input"), {
          target: { value: "1234" },
        });

        sinon.assert.calledWithMatch(onChange.lastCall, {
          errorSchema: { __errors: ["Invalid"] },
          errors: [{ stack: "root: Invalid" }],
          formData: "1234",
        });
      });

      it("should submit form on valid data", () => {
        const schema = { type: "string" };
        const formData = "hello";
        const onSubmit = sandbox.spy();

        function validate(formData, errors) {
          if (formData !== "hello") {
            errors.addError("Invalid");
          }
          return errors;
        }

        const { node } = createFormComponent({
          schema,
          formData,
          validate,
          onSubmit,
        });

        submitForm(node);

        sinon.assert.called(onSubmit);
      });

      it("should prevent form submission on invalid data", () => {
        const schema = { type: "string" };
        const formData = "a";
        const onSubmit = sandbox.spy();
        const onError = sandbox.spy();

        function validate(formData, errors) {
          if (formData !== "hello") {
            errors.addError("Invalid");
          }
          return errors;
        }

        const { node } = createFormComponent({
          schema,
          formData,
          validate,
          onSubmit,
          onError,
        });

        submitForm(node);

        sinon.assert.notCalled(onSubmit);
        sinon.assert.called(onError);
      });

      it("should validate a simple object", () => {
        const schema = {
          type: "object",
          properties: {
            pass1: { type: "string", minLength: 3 },
            pass2: { type: "string", minLength: 3 },
          },
        };

        const formData = { pass1: "aaa", pass2: "b" };

        function validate(formData, errors) {
          const { pass1, pass2 } = formData;
          if (pass1 !== pass2) {
            errors.pass2.addError("Passwords don't match");
          }
          return errors;
        }

        const { node, onError } = createFormComponent({
          schema,
          validate,
          formData,
        });
        submitForm(node);
        sinon.assert.calledWithMatch(onError.lastCall, [
          { stack: "pass2: should NOT be shorter than 3 characters" },
          { stack: "pass2: Passwords don't match" },
        ]);
      });

      it("should validate an array of object", () => {
        const schema = {
          type: "array",
          items: {
            type: "object",
            properties: {
              pass1: { type: "string" },
              pass2: { type: "string" },
            },
          },
        };

        const formData = [
          { pass1: "a", pass2: "b" },
          { pass1: "a", pass2: "a" },
        ];

        function validate(formData, errors) {
          formData.forEach(({ pass1, pass2 }, i) => {
            if (pass1 !== pass2) {
              errors[i].pass2.addError("Passwords don't match");
            }
          });
          return errors;
        }

        const { node, onError } = createFormComponent({
          schema,
          validate,
          formData,
        });

        submitForm(node);
        sinon.assert.calledWithMatch(onError.lastCall, [
          { stack: "pass2: Passwords don't match" },
        ]);
      });

      it("should validate a simple array", () => {
        const schema = {
          type: "array",
          items: {
            type: "string",
          },
        };

        const formData = ["aaa", "bbb", "ccc"];

        function validate(formData, errors) {
          if (formData.indexOf("bbb") !== -1) {
            errors.addError("Forbidden value: bbb");
          }
          return errors;
        }

        const { node, onError } = createFormComponent({
          schema,
          validate,
          formData,
        });
        submitForm(node);
        sinon.assert.calledWithMatch(onError.lastCall, [
          { stack: "root: Forbidden value: bbb" },
        ]);
      });
    });

    describe("showErrorList prop validation", () => {
      describe("Required fields", () => {
        const schema = {
          type: "object",
          required: ["foo"],
          properties: {
            foo: { type: "string" },
            bar: { type: "string" },
          },
        };

        let node, onError;
        beforeEach(() => {
          const compInfo = createFormComponent({
            schema,
            formData: {
              foo: undefined,
            },
            showErrorList: false,
          });
          node = compInfo.node;
          onError = compInfo.onError;

          submitForm(node);
        });

        it("should not render error list if showErrorList prop true", () => {
          expect(node.querySelectorAll(".errors li")).to.have.length.of(0);
        });

        it("should trigger onError call", () => {
          sinon.assert.calledWithMatch(onError.lastCall, [
            {
              message: "is a required property",
              name: "required",
              params: { missingProperty: "foo" },
              property: ".foo",
              schemaPath: "#/required",
              stack: ".foo is a required property",
            },
          ]);
        });
      });
    });

    describe("Custom ErrorList", () => {
      const schema = {
        type: "string",
        minLength: 1,
      };

      const uiSchema = {
        foo: "bar",
      };

      const formData = 0;

      const CustomErrorList = ({
        errors,
        errorSchema,
        schema,
        uiSchema,
        formContext: { className },
      }) => (
        <div>
          <div className="CustomErrorList">{errors.length} custom</div>
          <div className={"ErrorSchema"}>{errorSchema.__errors[0]}</div>
          <div className={"Schema"}>{schema.type}</div>
          <div className={"UiSchema"}>{uiSchema.foo}</div>
          <div className={className} />
        </div>
      );

      it("should use CustomErrorList", () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          liveValidate: true,
          formData,
          ErrorList: CustomErrorList,
          formContext: { className: "foo" },
        });
        expect(node.querySelectorAll(".CustomErrorList")).to.have.length.of(1);
        expect(node.querySelector(".CustomErrorList").textContent).eql(
          "1 custom"
        );
        expect(node.querySelectorAll(".ErrorSchema")).to.have.length.of(1);
        expect(node.querySelector(".ErrorSchema").textContent).eql(
          "should be string"
        );
        expect(node.querySelectorAll(".Schema")).to.have.length.of(1);
        expect(node.querySelector(".Schema").textContent).eql("string");
        expect(node.querySelectorAll(".UiSchema")).to.have.length.of(1);
        expect(node.querySelector(".UiSchema").textContent).eql("bar");
        expect(node.querySelectorAll(".foo")).to.have.length.of(1);
      });
    });
    describe("Custom meta schema", () => {
      let onError, node;
      const formData = {
        datasetId: "no err",
      };

      const schema = {
        $ref: "#/definitions/Dataset",
        $schema: "http://json-schema.org/draft-04/schema#",
        definitions: {
          Dataset: {
            properties: {
              datasetId: {
                pattern: "\\d+",
                type: "string",
              },
            },
            required: ["datasetId"],
            type: "object",
          },
        },
      };

      beforeEach(() => {
        const validator = customizeValidator({
          additionalMetaSchemas: [
            require("ajv/lib/refs/json-schema-draft-04.json"),
          ],
        });
        const withMetaSchema = createFormComponent({
          schema,
          formData,
          liveValidate: true,
          validator,
        });
        node = withMetaSchema.node;
        onError = withMetaSchema.onError;
        submitForm(node);
      });
      it("should be used to validate schema", () => {
        expect(node.querySelectorAll(".errors li")).to.have.length.of(1);
        sinon.assert.calledWithMatch(onError.lastCall, [
          {
            message: 'should match pattern "\\d+"',
            name: "pattern",
            params: { pattern: "\\d+" },
            property: ".datasetId",
            schemaPath: "#/properties/datasetId/pattern",
            stack: '.datasetId should match pattern "\\d+"',
          },
        ]);
        onError.resetHistory();

        Simulate.change(node.querySelector("input"), {
          target: { value: "1234" },
        });
        expect(node.querySelectorAll(".errors li")).to.have.length.of(0);
        sinon.assert.notCalled(onError);
      });
    });
  });
});
