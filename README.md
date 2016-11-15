react-jsonschema-form
=====================

[![Build Status](https://travis-ci.org/mozilla-services/react-jsonschema-form.svg)](https://travis-ci.org/mozilla-services/react-jsonschema-form)

A simple [React](http://facebook.github.io/react/) component capable of building HTML forms out of a [JSON schema](http://jsonschema.net/) and using [Bootstrap](http://getbootstrap.com/) semantics by default.

A [live playground](https://mozilla-services.github.io/react-jsonschema-form/) is hosted on gh-pages.

![](http://i.imgur.com/bmQ3HlO.png)

## Table of Contents

  - [Installation](#installation)
     - [As a npm-based project dependency](#as-a-npm-based-project-dependency)
     - [As a script served from a CDN](#as-a-script-served-from-a-cdn)
  - [Usage](#usage)
     - [Form initialization](#form-initialization)
     - [Form event handlers](#form-event-handlers)
        - [Form submission](#form-submission)
        - [Form error event handler](#form-error-event-handler)
        - [Form data changes](#form-data-changes)
  - [Form customization](#form-customization)
     - [The uiSchema object](#the-uischema-object)
     - [Alternative widgets](#alternative-widgets)
        - [For boolean fields](#for-boolean-fields)
        - [For string fields](#for-string-fields)
           - [String formats](#string-formats)
        - [For number and integer fields](#for-number-and-integer-fields)
        - [Disabled fields](#disabled-fields)
        - [Read-only fields](#read-only-fields)
        - [Hidden widgets](#hidden-widgets)
        - [File widgets](#file-widgets)
           - [Multiple files](#multiple-files)
           - [File widget input ref](#file-widget-input-ref)
     - [Object fields ordering](#object-fields-ordering)
     - [Array item options](#array-item-options)
        - [orderable option](#orderable-option)
        - [addable option](#addable-option)
        - [removable option](#removable-option)
     - [Custom CSS class names](#custom-css-class-names)
     - [Custom labels for enum fields](#custom-labels-for-enum-fields)
     - [Multiple choices list](#multiple-choices-list)
     - [Autogenerated widget ids](#autogenerated-widget-ids)
     - [Form action buttons](#form-action-buttons)
     - [Help texts](#help-texts)
     - [Auto focus](#auto-focus)
     - [Placeholders](#placeholders)
     - [Form attributes](#form-attributes)
  - [Advanced customization](#advanced-customization)
     - [Field template](#field-template)
     - [Custom widgets and fields](#custom-widgets-and-fields)
     - [Custom widget components](#custom-widget-components)
        - [Custom component registration](#custom-component-registration)
        - [Custom widget options](#custom-widget-options)
     - [Custom field components](#custom-field-components)
        - [Field props](#field-props)
        - [The registry object](#the-registry-object)
        - [The formContext object](#the-formcontext-object)
     - [Custom array field buttons](#custom-array-field-buttons)
     - [Custom SchemaField](#custom-schemafield)
     - [Customizing the default fields and widgets](#customizing-the-default-fields-and-widgets)
     - [Custom titles](#custom-titles)
     - [Custom descriptions](#custom-descriptions)
  - [Form data validation](#form-data-validation)
     - [Live validation](#live-validation)
     - [Custom validation](#custom-validation)
     - [Error List Display](#error-list-display)
  - [Styling your forms](#styling-your-forms)
  - [Schema definitions and references](#schema-definitions-and-references)
  - [JSON Schema supporting status](#json-schema-supporting-status)
  - [Contributing](#contributing)
     - [Development server](#development-server)
     - [Tests](#tests)
        - [TDD](#tdd)
  - [License](#license)

---

## Installation

Requires React 15.0.0+.


### As a npm-based project dependency

```
$ npm install react-jsonschema-form --save
```

> Note: While the library renders [Bootstrap](http://getbootstrap.com/) HTML semantics, you have to build/load the Bootstrap styles on your own.

### As a script served from a CDN

```html
  <script src="https://unpkg.com/react-jsonschema-form/dist/react-jsonschema-form.js"></script>
```

Source maps are available at [this url](https://unpkg.com/react-jsonschema-form/dist/react-jsonschema-form.js.map).

> Note: The CDN version **does not** embed *react* nor *react-dom*.
>
> You'll also need to alias the default export property to use the Form component:

```jsx
const Form = JSONSchemaForm.default;
// or
const {default: Form} = JSONSchemaForm;
```

## Usage

```jsx
import React, { Component } from "react";
import { render } from "react-dom";

import Form from "react-jsonschema-form";

const schema = {
  title: "Todo",
  type: "object",
  required: ["title"],
  properties: {
    title: {type: "string", title: "Title", default: "A new task"},
    done: {type: "boolean", title: "Done?", default: false}
  }
};

const log = (type) => console.log.bind(console, type);

render((
  <Form schema={schema}
        onChange={log("changed")}
        onSubmit={log("submitted")}
        onError={log("errors")} />
), document.getElementById("app"));
```

That should give something like this (if you took care of loading the standard [Bootstrap](http://getbootstrap.com/) stylesheet):

![](http://i.imgur.com/DZQYPyu.png)

### Form initialization

Often you'll want to prefill a form with existing data; this is done by passing a `formData` prop object matching the schema:

```jsx
const formData = {
  title: "First task",
  done: true
};

render((
  <Form schema={schema}
        formData={formData}
), document.getElementById("app"));
```

NOTE: If your form have a single field, pass a single value to `formData`. ex: `formData='Charlie'`

WARNING: If you have situations where your parent component can re-render, make sure you listen to the `onChange` event and update the data you pass to the `formData` attribute.

### Form event handlers

#### Form submission

You can pass a function as the `onSubmit` prop of your `Form` component to listen to when the form is submitted and its data are valid. It will be passed a result object having a `formData` attribute, which is the valid form data you're usually after:

```js
const onSubmit = ({formData}) => console.log("yay I'm valid!");

render((
  <Form schema={schema}
        onSubmit={onSubmit} />
), document.getElementById("app"));
```

#### Form error event handler

To react to when submitted form data are invalid, pass an `onError` handler, which is passed the list of encoutered errors:

```js
const onError = (errors) => console.log("I have", errors.length, "errors to fix");

render((
  <Form schema={schema}
        onError={onError} />
), document.getElementById("app"));
```

#### Form data changes

If you plan on being notified everytime the form data are updated, you can pass an `onChange` handler, which will receive the same args as `onSubmit` any time a value is updated in the form.

## Form customization

### The `uiSchema` object

JSONSchema is limited for describing how a given data type should be rendered as a form input component, that's why this lib introduces the concept of *UI schema*.

A UI schema is basically an object literal providing information on **how** the form should be rendered, while the JSON schema tells **what**.

The uiSchema object follows the tree structure of the form field hierarchy, and for each allows to define how it should be rendered:

```js
const schema = {
  type: "object",
  properties: {
    foo: {
      type: "object",
      properties: {
        bar: {type: "string"}
      }
    },
    baz: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: {
            "type": "string"
          }
        }
      }
    }
  }
}

const uiSchema = {
  foo: {
    bar: {
      "ui:widget": "textarea"
    },
    baz: {
      // note the "items" for an array
      items: {
        description: {
          "ui:widget": "textarea"
        }
      }
    }
  }
}

render((
  <Form schema={schema}
        uiSchema={uiSchema} />
), document.getElementById("app"));
```

### Alternative widgets

The uiSchema `ui:widget` property tells the form which UI widget should be used to render a certain field:

Example:

```jsx
const uiSchema =  {
  done: {
    "ui:widget": "radio" // could also be "select"
  }
};

render((
  <Form schema={schema}
        uiSchema={uiSchema}
        formData={formData} />
), document.getElementById("app"));
```

Here's a list of supported alternative widgets for different JSONSchema data types:

#### For `boolean` fields

  * `radio`: a radio button group with `true` and `false` as selectable values;
  * `select`: a select box with `true` and `false` as options;
  * by default, a checkbox is used

> Note: To set the labels for a boolean field, instead of using `true` and `false` you can set `enumNames` in your schema. Note that `enumNames` belongs in your `schema`, not the `uiSchema`, and the order is always `[true, false]`.

#### For `string` fields

  * `textarea`: a `textarea` element is used;
  * `password`: an `input[type=password]` element is used;
  * `color`: an `input[type=color]` element is used;
  * by default, a regular `input[type=text]` element is used.

##### String formats

The built-in string field also supports the JSONSchema `format` property, and will render an appropriate widget by default for the following string formats:

- `email`: An `input[type=email]` element is used;
- `uri`: An `input[type=url]` element is used;
- `data-url`: By default, an `input[type=file]` element is used; in case the string is part of an array, multiple files will be handled automatically (see [File widgets](#file-widgets)).
- `date`: By default, an `input[type=date]` element is used;
- `date-time`: By default, an `input[type=datetime-local]` element is used.

![](http://i.imgur.com/xqu6Lcp.png)

Please note that while standardized, `datetime-local` and `date` input elements are not yet supported by Firefox and IE. If you plan on targetting these platforms, two alternative widgets are available:

- `alt-datetime`: Six `select` elements are used to select the year, the month, the day, the hour, the minute and the second;
- `alt-date`: Three `select` elements are used to select the year, month and the day.

![](http://i.imgur.com/VF5tY60.png)

#### For `number` and `integer` fields

  * `updown`: an `input[type=number]` updown selector;
  * `range`: an `input[type=range]` slider;
  * `radio`: a radio button group with enum values. **can only be used when `enum` values are specified for this input**
  * by default, a regular `input[type=text]` element is used.

> Note: for numbers, `min`, `max` and `step` input attributes values will be handled according to JSONSchema's `minimum`, `maximium` and `multipleOf` values when they're defined.

#### Disabled fields

The `ui:disabled` uiSchema directive will disable all child widgets from a given field.

#### Read-only fields

The `ui:readonly` uiSchema directive will mark all child widgets from a given field as read-only.

> Note: if you're about the difference between a *disabled* field and a *readonly* one: marking a field as read-only will render it greyed but its text value will be selectable; disabling it will prevent its value to be selected at all.

#### Hidden widgets

It's possible to use an hidden widget for a given field by setting the `ui:widget` uiSchema directive to `hidden` for this field:

```js
const schema = {
  type: "object",
  properties: {
    foo: {type: "boolean"}
  }
};

const uiSchema = {
  foo: {"ui:widget": "hidden"}
};
```

> Notes
>
> - Hiding widgets is only supported for `boolean`, `string`, `number` and `integer` schema types;
> - An hidden widget takes its value from the `formData` prop.

#### File widgets

This library supports a limited form of `input[type=file]` widgets, in the sense that it will propagate file contents to form data state as [data-url](http://dataurl.net/#about)s.

There are two ways to use file widgets:

**By declaring a `string` json schema type along a `data-url` [format](#string-formats):**

```js
const schema = {
  type: "string",
  format: "data-url",
};
```

**By specifying a `ui:widget` field uiSchema directive as `file`:**

```js
const schema = {
  type: "string",
};

const uiSchema = {
  "ui:widget": "file",
};
```

##### Multiple files

Multiple files selectors are supported by defining an array of strings having `data-url` as a format:

```js
const schema = {
  type: "array",
  items: {
    type: "string",
    format: "data-url",
  }
};
```

> Note that storing large dataURIs into form state might slow rendering.

##### File widget input ref

The included `FileWidget` exposes a reference to the `<input type="file" />` element node as an `inputRef` component property.

This allows you to programmatically trigger the browser's file selector which can be used in a custom file widget.

### Object fields ordering

Since the order of object properties in Javascript and JSON is not guaranteed, the `uiSchema` object spec allows you to define the order in which properties are rendered using the `ui:order` property:

```jsx
const schema = {
  type: "object",
  properties: {
    foo: {type: "string"},
    bar: {type: "string"}
  }
};

const uiSchema = {
  "ui:order": ["bar", "foo"]
};

render((
  <Form schema={schema}
        uiSchema={uiSchema} />
), document.getElementById("app"));
```

If a guarenteed fixed order is only important for some fields, you can insert a wildcard `"*"` item in your `ui:order` definition. All fields that are not referenced explicitly anywhere in the list will be rendered at that point:

```js
const uiSchema = {
  "ui:order": ["bar", "*"]
};
```

### Array item options

#### `orderable` option

Array items are orderable by default, and react-jsonschema-form renders move up/down buttons alongside them. The `uiSchema` object spec allows you to disable ordering:

```jsx
const schema = {
  type: "array",
  items: {
    type: "string"
  }
};

const uiSchema = {
  "ui:options":  {
    orderable: false
  }
};
```

#### `addable` option

If either `items` or `additionalItems` contains a schema object, an add button for new items is shown by default. You can turn this off with the `addable` option in `uiSchema`:

```jsx
const uiSchema = {
  "ui:options":  {
    addable: false
  }
};
```

#### `removable` option

A remove button is shown by default for an item if `items` contains a schema object, or the item is an `additionalItems` instance. You can turn this off with the `removable` option in `uiSchema`:

```jsx
const uiSchema = {
  "ui:options":  {
    removable: false
  }
};
```

### Custom CSS class names

The uiSchema object accepts a `classNames` property for each field of the schema:

```jsx
const uiSchema = {
  title: {
    classNames: "task-title foo-bar"
  }
};
```

Will result in:

```html
<div class="field field-string task-title foo-bar" >
  <label>
    <span>Title*</span>
    <input value="My task" required="" type="text">
  </label>
</div>
```

### Custom labels for `enum` fields

This library supports the [`enumNames`](https://github.com/json-schema/json-schema/wiki/enumNames-%28v5-proposal%29) property for `enum` fields, which allows defining custom labels for each option of an `enum`:

```js
const schema = {
  type: "number",
  enum: [1, 2, 3],
  enumNames: ["one", "two", "three"]
};
```

This will be rendered using a select box that way:

```html
<select>
  <option value="1">one</option>
  <option value="2">two</option>
  <option value="3">three</option>
</select>
```

Note that string representations of numbers will be cast back and reflected as actual numbers into form state.

### Multiple choices list

The default behavior for array fields is a list of text inputs with add/remove buttons. Though there are two alternative simpler widgets for common situations like picking elements against a list of choices; typically this maps to a schema having:

- an `enum` list for the `items` property of an `array` field
- with the `uniqueItems` property set to `true`

Example:

```js
const schema = {
  type: "array",
  title: "A multiple choices list",
  items: {
    type: "string",
    enum: ["foo", "bar", "fuzz", "qux"],
  },
  uniqueItems: true
};
```

By default, this will automatically render a multiple select box. If you prefer a list of checkboxes, just set the uiSchema `ui:widget` directive to `"checkboxes"` for that field:

```js
const uiSchema = {
  "ui:widget": "checkboxes"
};
```

By default, checkboxes are stacked but if you prefer them inline:

```js
const uiSchema = {
  "ui:widget": "checkboxes",
  "ui:options": {
    inline: true
  }
};
```

See the "Arrays" section of the playground for cool demos.

### Autogenerated widget ids

By default, the lib will generate ids unique to the form for all rendered widgets. But if you plan on using multiple instances of the `Form` component in a same page, it's wise to declare a root prefix for these, using the `ui:rootFieldId` uiSchema directive:

```js
const uiSchema = {
  "ui:rootFieldId": "myform"
};
```

So all widgets will have an id prefixed with `myform`.

### Form action buttons

You can provide custom buttons to your form via the `Form` component's `children`. A default submit button will be rendered if you don't provide children to the `Form` component.

```jsx
render((
  <Form schema={schema}>
    <div>
      <button type="submit">Submit</button>
      <button>Cancel</button>
    </div>
  </Form>
), document.getElementById("app"));
```

**Warning:** there should be a button or an input with `type="submit"` to trigger the form submission (and then the form validation).

### Help texts

Sometimes it's convenient to add some text next to a field to guide the end user filling it; this is the purpose of the `ui:help` uiSchema directive:

```js
const schema = {type: "string"};
const uiSchema = {
  "ui:widget": "password",
  "ui:help": "Hint: Make it strong!"
};
```

![](http://i.imgur.com/scJUuZo.png)

Help texts work for any kind of field at any level, and will always be rendered immediately below the field component widget(s), but after contextualized errors, if any.

### Auto focus

If you want to focus on a text input or textarea input/on a widget automatically, just set `ui:autofocus` uiSchema directive to `true`.

```js
const schema = {type: "string"};
const uiSchema = {
  "ui:widget": "textarea",
  "ui:autofocus": true
}
```

### Placeholders

Text fields can benefit from placeholders by using the `ui:placeholder` uiSchema directive:

```jsx
const schema = {type: "string", format: "uri"};
const uiSchema = {
  "ui:placeholder": "http://"
};
```

![](http://i.imgur.com/MbHypKg.png)

### Form attributes

Form component supports the following html attributes:

```jsx
<Form
  id="edit-form"
  className="form form-wide"
  name="awesomeForm"
  method="post"
  target="_blank"
  action="/users/list"
  autocomplete="off"
  enctype="multipart/form-data"
  acceptcharset="ISO-8859-1"
  schema={} />
```

## Advanced customization

### Field template

To take control over the inner organization of each field (each form row), you can define a *field template* for your form.

A field template is basically a React stateless component being passed field-related props so you can structure your form row as you like:

```jsx
function CustomFieldTemplate(props) {
  const {id, classNames, label, help, required, description, errors, children} = props;
  return (
    <div className={classNames}>
      <label htmlFor={id}>{label}{required ? "*" : null}</label>
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
}

render((
  <Form schema={schema}
        FieldTemplate={CustomFieldTemplate} />,
), document.getElementById("app"));
```

If you want to handle the rendering of each element yourself, you can use the props `rawHelp`, `rawDescription` and `rawErrors`.

The following props are passed to a custom field template component:

- `id`: The id of the field in the hierarchy. You can use it to render a label targetting the wrapped widget.
- `classNames`: A string containing the base bootstrap CSS classes merged with any [custom ones](#custom-css-class-names) defined in your uiSchema.
- `label`: The computed label for this field, as a string.
- `description`: A component instance rendering the field description, if any defined (this will use any [custom `DescriptionField`](#custom-descriptions) defined).
- `rawDescription`: A string containing any `ui:description` uiSchema directive defined.
- `children`: The field or widget component instance for this field row.
- `errors`: A component instance listing any encountered errors for this field.
- `rawErrors`: An array of strings listing all generated error messages from encountered errors for this field.
- `help`: A component instance rendering any `ui:help` uiSchema directive defined.
- `rawHelp`: A string containing any `ui:help` uiSchema directive defined. **NOTE:** `rawHelp` will be `undefined` if passed `ui:help` is a React component instead of a string.
- `hidden`: A boolean value stating if the field should be hidden.
- `required`: A boolean value stating if the field is required.
- `readonly`: A boolean value stating if the field is read-only.
- `displayLabel`: A boolean value stating if the label should be rendered or not. This is useful for nested fields in arrays where you don't want to clutter the UI.
- `fields`: An array containing all Form's fields including your [custom fields](#custom-field-components) and the built-in fields.
- `schema`: The schema object for this field.
- `uiSchema`: The uiSchema object for this field.
- `formContext`: The `formContext` object that you passed to Form.

> Note: you can only define a single field template for a form. If you need many, it's probably time to look at [custom fields](#custom-field-components) instead.

### Custom widgets and fields

The API allows to specify your own custom *widget* and *field* components:

- A *widget* represents a HTML tag for the user to enter data, eg. `input`, `select`, etc.
- A *field* usually wraps one or more widgets and most often handles internal field state; think of a field as a form row, including the labels.

### Custom widget components

You can provide your own custom widgets to a uiSchema for the following json data types:

- `string`
- `number`
- `integer`
- `boolean`

```jsx
const schema = {
  type: "string"
};

const uiSchema = {
  "ui:widget": (props) => {
    return (
      <input type="text"
        className="custom"
        value={props.value}
        required={props.required}
        onChange={(event) => props.onChange(event.target.value)} />
    );
  }
};

render((
  <Form schema={schema}
        uiSchema={uiSchema} />,
), document.getElementById("app"));
```

The following props are passed to custom widget components:

- `schema`: The JSONSchema subschema object for this field;
- `value`: The current value for this field;
- `required`: The required status of this field;
- `disabled`: `true` if the widget is disabled;
- `readonly`: `true` if the widget is read-only;
- `onChange`: The value change event handler; call it with the new value everytime it changes;
- `options`: A map of options passed as a prop to the component (see [Custom widget options](#custom-widget-options)).
- `formContext`: The `formContext` object that you passed to Form.

> Note: Prior to v0.35.0, the `options` prop contained the list of options (`label` and `value`) for `enum` fields. Since v0.35.0, it now exposes this list as the `enumOptions` property within the `options` object.

#### Custom component registration

Alternatively, you can register them all at once by passing the `widgets` prop to the `Form` component, and reference their identifier from the `uiSchema`:

```jsx
const MyCustomWidget = (props) => {
  return (
    <input type="text"
      className="custom"
      value={props.value}
      required={props.required}
      onChange={(event) => props.onChange(event.target.value)} />
  );
};

const widgets = {
  myCustomWidget: MyCustomWidget
};

const uiSchema = {
  "ui:widget": "myCustomWidget"
}

render((
  <Form
    schema={schema}
    uiSchema={uiSchema}
    widgets={widgets} />
), document.getElementById("app"));
```

This is useful if you expose the `uiSchema` as pure JSON, which can't carry functions.

> Note: Until 0.40.0 it was possible to register a widget as object with shape `{ component: MyCustomWidget, options: {...} }`. This undocumented API has been removed. Instead, you can register a custom widget with a React `defaultProps` property. `defaultProps.options` can be an object containing your custom options.

#### Custom widget options

If you need to pass options to your custom widget, you can add a `ui:options` object containing those properties. If the widget has `defaultProps`, the options will be merged with the (optional) options object from `defaultProps`:

```jsx
const schema = {
  type: "string"
};

function MyCustomWidget(props) {
  const {options} = props;
  const {color, backgroundColor} = options;
  return <input style={{color, backgroundColor}} />;
}

MyCustomWidget.defaultProps = {
  options: {
    color: "red"
  }
};

const uiSchema = {
  "ui:widget": MyCustomWidget,
  "ui:options": {
    backgroundColor: "yellow"
  }
};

// renders red on yellow input
render((
  <Form schema={schema}
        uiSchema={uiSchema} />
), document.getElementById("app"));
```

> Note: This also applies to [registered custom components](#custom-component-registration).

> Note: Since v0.41.0, the `ui:widget` object API, where a widget and options were specified with `"ui:widget": {component, options}` shape, is deprecated. It will be removed in a future release.

### Custom field components

You can provide your own field components to a uiSchema for basically any json schema data type, by specifying a `ui:field` property.

For example, let's create and register a dumb `geo` component handling a *latitude* and a *longitude*:

```jsx
const schema = {
  type: "object",
  required: ["lat", "lon"],
  properties: {
    lat: {type: "number"},
    lon: {type: "number"}
  }
};

// Define a custom component for handling the root position object
class GeoPosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {...props.formData};
  }

  onChange(name) {
    return (event) => {
      this.setState({
        [name]: parseFloat(event.target.value)
      }, () => this.props.onChange(this.state));
    };
  }

  render() {
    const {lat, lon} = this.state;
    return (
      <div>
        <input type="number" value={lat} onChange={this.onChange("lat")} />
        <input type="number" value={lon} onChange={this.onChange("lon")} />
      </div>
    );
  }
}

// Define the custom field component to use for the root object
const uiSchema = {"ui:field": "geo"};

// Define the custom field components to register; here our "geo"
// custom field component
const fields = {geo: GeoPosition};

// Render the form with all the properties we just defined passed
// as props
render((
  <Form
    schema={schema}
    uiSchema={uiSchema}
    fields={fields} />
), document.getElementById("app"));
```

> Note: Registered fields can be reused across the entire schema.

#### Field props

A field component will always be passed the following props:

 - `schema`: The JSON schema for this field;
 - `uiSchema`: The [uiSchema](#the-uischema-object) for this field;
 - `idSchema`: The tree of unique ids for every child field;
 - `formData`: The data for this field;
 - `errorSchema`: The tree of errors for this field and its children;
 - `registry`: A [registry](#the-registry-object) object (read next).
 - `formContext`: A [formContext](#the-formcontext-object) object (read next next).

#### The `registry` object

The `registry` is an object containing the registered custom fields and widgets as well as root schema definitions.

 - `fields`: The [custom registered fields](#custom-field-components). By default this object contains the standard `SchemaField`, `TitleField` and `DescriptionField` components;
 - `widgets`: The [custom registered widgets](#custom-widget-components), if any;
 - `definitions`: The root schema [definitions](#schema-definitions-and-references), if any.
 - `formContext`: The [formContext](#the-formcontext-object) object.

The registry is passed down the component tree, so you can access it from your custom field and `SchemaField` components.

#### The `formContext` object

You can provide a `formContext` object to the Form, which is passed down to all fields and widgets (including [TitleField](#custom-titles) and [DescriptionField](#custom-descriptions)). Useful for implementing context aware fields and widgets.

### Custom array field buttons

The `ArrayField` component provides a UI to add, remove and reorder array items, and these buttons use [Bootstrap glyphicons](http://getbootstrap.com/components/#glyphicons). If you don't use Bootstrap yet still want to provide your own icons or texts for these buttons, you can easily do so using CSS:

```css
.btn-plus > i {
  display: none;
}
.btn-plus::after {
  content: "Add";
}
```

### Custom SchemaField

**Warning:** This is a powerful feature as you can override the whole form behavior and easily mess it up. Handle with care.

You can provide your own implementation of the `SchemaField` base React component for rendering any JSONSchema field type, including objects and arrays. This is useful when you want to augment a given field type with supplementary powers.

To proceed so, pass a `fields` object having a `SchemaField` property to your `Form` component; here's a rather silly example wrapping the standard `SchemaField` lib component:

```jsx
import SchemaField from "react-jsonschema-form/lib/components/fields/SchemaField";

const CustomSchemaField = function(props) {
  return (
    <div id="custom">
      <p>Yeah, I'm pretty dumb.</p>
      <SchemaField {...props} />
    </div>
  );
};

const fields = {
  SchemaField: CustomSchemaField
};

render((
  <Form schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        fields={fields} />
), document.getElementById("app"));
```

If you're curious how this could ever be useful, have a look at the [Kinto formbuilder](https://github.com/Kinto/formbuilder) repository to see how it's used to provide editing capabilities to any form field.

Props passed to a custom SchemaField are the same as [the ones passed to a custom field](#field-props).

### Customizing the default fields and widgets

You can override any default field and widget, including the internal widgets like the `CheckboxWidget` that `ObjectField` renders for boolean values. You can override any field and widget just by providing the customized fields/widgets in the `fields` and `widgets` props:

```jsx

const CustomCheckbox = function(props) {
  return (
    <button id="custom" className={props.value ? "checked" : "unchecked"} onClick={props.onChange(!props.value)}>
    	{props.value}
    </button>
  );
};

const widgets = {
  CheckboxWidget: CustomCheckbox
};

render((
  <Form schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        widgets={widgets} />
), document.getElementById("app"));
```

This allows you to create a reusable customized form class with your custom fields and widgets:

```jsx
const customFields = {StringField: CustomString};
const customWidgets = {CheckboxWidget: CustomCheckbox};

function MyForm(props) {
  return <Form fields={customFields} widgets={customWidgets} {...props} />;
}

render((
  <MyForm schema={schema}
    uiSchema={uiSchema}
    formData={formData} />
), document.getElementById("app"));
```

### Custom titles

You can provide your own implementation of the `TitleField` base React component for rendering any title. This is useful when you want to augment how titles are handled.

Simply pass a `fields` object having a `TitleField` property to your `Form` component:

```jsx

const CustomTitleField = ({title, required}) => {
  const legend = required ? title + '*' : title;
  return <div id="custom">{legend}</div>;
};

const fields = {
  TitleField: CustomTitleField
};

render((
  <Form schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        fields={fields} />
), document.getElementById("app"));
```

### Custom descriptions

You can provide your own implementation of the `DescriptionField` base React component for rendering any description.

Simply pass a `fields` object having a `DescriptionField` property to your `Form` component:

```jsx

const CustomDescriptionField = ({id, description}) => {
  return <div id={id}>{description}</div>;
};

const fields = {
  DescriptionField: CustomDescriptionField
};

render((
  <Form schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        fields={fields} />
), document.getElementById("app"));
```

## Form data validation

### Live validation

By default, form data are only validated when the form is submitted or when a new `formData` prop is passed to the `Form` component.

You can enable live form data validation by passing a `liveValidate` prop to the `Form` component, and set it to `true`. Then, everytime a value changes within the form data tree (eg. the user entering a character in a field), a validation operation is performed, and the validation results are reflected into the form state.

Be warned that this is an expensive strategy, with possibly strong impact on performances.

To disable validation entirely, you can set Form's `noValidate` prop to `true`.

### Custom validation

Form data is always validated against the JSON schema.

But it is possible to define your own custom validation rules. This is especially useful when the validation depends on several interdependent fields.

```js
function validate(formData, errors) {
  if (formData.pass1 !== formData.pass2) {
    errors.pass2.addError("Passwords don't match");
  }
  return errors;
}

const schema = {
  type: "object",
  properties: {
    pass1: {type: "string", minLength: 3},
    pass2: {type: "string", minLength: 3},
  }
};

render((
  <Form schema={schema}
        validate={validate} />
), document.getElementById("app"));
```

> Notes:
> - The `validate()` function must **always** return the `errors` object
>   received as second argument.
> - The `validate()` function is called **after** the JSON schema validation.

### Error List Display

To disable rendering of the error list at the top of the form, you can set the `showErrorList` prop to `false`. Doing so will still validate the form, but only the inline display will show.

```js
render((
  <Form schema={schema}
        showErrorList={false}/>
), document.getElementById("app"));
```

## Styling your forms

This library renders form fields and widgets leveraging the [Bootstrap](http://getbootstrap.com/) semantics. That means your forms will be beautiful by default if you're loading its stylesheet in your page.

You're not necessarily forced to use Bootstrap; while it uses its semantics, it also provides a bunch of other class names so you can bring new styles or override default ones quite easily in your own personalized stylesheet. That's just HTML after all :)

If you're okay with using styles from the Bootstrap ecosystem though, then the good news is that you have access to many themes for it, which are compatible with our generated forms!

Here are some examples from the [playground](http://mozilla-services.github.io/react-jsonschema-form/), using some of the [Bootswatch](http://bootswatch.com/) free themes:

![](http://i.imgur.com/1Z5oUK3.png)
![](http://i.imgur.com/IMFqMwK.png)
![](http://i.imgur.com/HOACwt5.png)

Last, if you really really want to override the semantics generated by the lib, you can always create and use your own custom [widget](#custom-widget-components), [field](#custom-field-components) and/or [schema field](#custom-schemafield) components.

## Schema definitions and references

This library partially supports [inline schema definition dereferencing]( http://json-schema.org/latest/json-schema-core.html#rfc.section.7.2.3), which is Barbarian for *avoiding to copy and paste commonly used field schemas*:

```json
{
  "definitions": {
    "address": {
      "type": "object",
      "properties": {
        "street_address": { "type": "string" },
        "city":           { "type": "string" },
        "state":          { "type": "string" }
      },
      "required": ["street_address", "city", "state"]
    }
  },
  "type": "object",
  "properties": {
    "billing_address": { "$ref": "#/definitions/address" },
    "shipping_address": { "$ref": "#/definitions/address" }
  }
}
```

*(Sample schema courtesy of the [Space Telescope Science Institute](http://spacetelescope.github.io/understanding-json-schema/structuring.html))*

Note that it only supports local definition referencing, we do not plan on fetching foreign schemas over HTTP anytime soon. Basically, you can only reference a definition from the very schema object defining it.

## JSON Schema supporting status

This component follows [JSON Schema](http://json-schema.org/documentation.html) specs. Due to the limitation of form widgets, there are some exceptions as follows:

* `additionalItems` keyword for arrays
    This keyword works when `items` is an array. `additionalItems: true` is not supported because there's no widget to represent an item of any type. In this case it will be treated as no additional items allowed. `additionalItems` being a valid schema is supported.

## Contributing

### Development server

```
$ npm start
```

A live development server showcasing components with hot reload enabled is available at [localhost:8080](http://localhost:8080).

If you want the development server to listen on another host or port, you can use the RJSF_DEV_SERVER env variable:

```
$ RJSF_DEV_SERVER=0.0.0.0:8000 npm start
```

### Tests

```
$ npm test
```

#### TDD

```
$ npm run tdd
```

## License

Apache 2
