module.exports = {
  schema: {
    title: "A registration form",
    type: "object",
    required: ["firstName", "lastName"],
    properties: {
      description: {
        type: "string",
        description: "This is a form where you can define some data."
      },
      firstName: {
        type: "string",
        title: "First name",
      },
      lastName: {
        type: "string",
        title: "Last name",
      },
      age: {
        type: "integer",
        title: "Age"
      },
      bio: {
        type: "string",
        title: "Bio",
      },
      password: {
        type: "string",
        title: "Password",
        minLength: 3
      }
    }
  },
  uiSchema: {
    description: {
      "ui:widget": "paragraph"
    },
    age: {
      "ui:widget": "updown"
    },
    bio: {
      "ui:widget": "textarea"
    },
    password: {
      "ui:widget": "password",
      "ui:help": "Hint: Make it strong!"
    },
    date: {
      "ui:widget": "alt-datetime"
    }
  },
  formData: {
    firstName: "Chuck",
    lastName: "Norris",
    age: 75,
    bio: "Roundhouse kicking asses since 1940",
    password: "noneed"
  }
};
