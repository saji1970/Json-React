import {
  retrieveSchema,
  RJSFSchema,
  createSchemaUtils,
  ADDITIONAL_PROPERTY_FLAG,
} from '../../src';
import {
  resolveSchema,
  stubExistingAdditionalProperties,
  withDependentProperties,
  withExactlyOneSubschema,
} from '../../src/schema/retrieveSchema';
import { TestValidatorType } from './types';

export default function retrieveSchemaTest(testValidator: TestValidatorType) {
  describe('retrieveSchema()', () => {
    let consoleWarnSpy: jest.SpyInstance;
    beforeAll(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(); // mock this to avoid actually warning in the tests
    });
    afterAll(() => {
      consoleWarnSpy.mockRestore();
    });
    afterEach(() => {
      consoleWarnSpy.mockClear();
    });
    it('returns empty object when schema is not an object', () => {
      expect(retrieveSchema(testValidator, [] as RJSFSchema)).toEqual({});
    });
    it('should `resolve` a schema which contains definitions', () => {
      const schema: RJSFSchema = { $ref: '#/definitions/address' };
      const address: RJSFSchema = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };
      const rootSchema: RJSFSchema = { definitions: { address } };

      expect(retrieveSchema(testValidator, schema, rootSchema)).toEqual(
        address
      );
    });

    it('should `resolve` a schema which contains definitions not in `#/definitions`', () => {
      const address: RJSFSchema = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };
      const schema: RJSFSchema = {
        $ref: '#/definitions/address',
        definitions: { address },
      };

      expect(retrieveSchema(testValidator, schema, schema)).toEqual({
        definitions: { address },
        ...address,
      });
    });

    it('should give an error when JSON pointer is not in a URI encoded format', () => {
      const address: RJSFSchema = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };
      const schema: RJSFSchema = {
        $ref: '/definitions/schemas/address',
        definitions: { address },
      };

      expect(() => retrieveSchema(testValidator, schema, schema)).toThrowError(
        'Could not find a definition'
      );
    });

    it('should give an error when JSON pointer does not point to anything', () => {
      const schema: RJSFSchema = {
        $ref: '#/definitions/schemas/address',
        definitions: { schemas: {} },
      };

      expect(() => retrieveSchema(testValidator, schema, schema)).toThrowError(
        'Could not find a definition'
      );
    });

    it('should `resolve` escaped JSON Pointers', () => {
      const schema: RJSFSchema = { $ref: '#/definitions/a~0complex~1name' };
      const address: RJSFSchema = { type: 'string' };
      const rootSchema: RJSFSchema = {
        definitions: { 'a~complex/name': address },
      };

      expect(retrieveSchema(testValidator, schema, rootSchema)).toEqual(
        address
      );
    });

    it('should `resolve` and stub out a schema which contains an `additionalProperties` with a definition', () => {
      const schema: RJSFSchema = {
        type: 'object',
        additionalProperties: {
          $ref: '#/definitions/address',
        },
      };

      const address: RJSFSchema = {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
        },
        required: ['street_address', 'city', 'state'],
      };

      const rootSchema: RJSFSchema = { definitions: { address } };
      const formData = { newKey: {} };

      expect(
        retrieveSchema(testValidator, schema, rootSchema, formData)
      ).toEqual({
        ...schema,
        properties: {
          newKey: {
            ...address,
            [ADDITIONAL_PROPERTY_FLAG]: true,
          },
        },
      });
    });

    it('should `resolve` and stub out a schema which contains an `additionalProperties` with a type and definition', () => {
      const schema: RJSFSchema = {
        type: 'string',
        additionalProperties: {
          $ref: '#/definitions/number',
        },
      };

      const number: RJSFSchema = {
        type: 'number',
      };

      const rootSchema: RJSFSchema = { definitions: { number } };
      const formData = { newKey: {} };

      expect(
        retrieveSchema(testValidator, schema, rootSchema, formData)
      ).toEqual({
        ...schema,
        properties: {
          newKey: {
            ...number,
            [ADDITIONAL_PROPERTY_FLAG]: true,
          },
        },
      });
    });

    it('should `resolve` and stub out a schema which contains an `additionalProperties` with oneOf', () => {
      const oneOf: RJSFSchema[] = [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ];
      const schema: RJSFSchema = {
        additionalProperties: {
          oneOf,
        },
        type: 'object',
      };

      const formData = { newKey: {} };
      expect(retrieveSchema(testValidator, schema, {}, formData)).toEqual({
        ...schema,
        properties: {
          newKey: {
            type: 'object',
            oneOf,
            [ADDITIONAL_PROPERTY_FLAG]: true,
          },
        },
      });
    });

    it('should `resolve` and stub out a schema which contains an `additionalProperties` with anyOf', () => {
      const anyOf: RJSFSchema[] = [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ];
      const schema: RJSFSchema = {
        additionalProperties: {
          anyOf,
        },
        type: 'object',
      };

      const formData = { newKey: {} };
      expect(retrieveSchema(testValidator, schema, {}, formData)).toEqual({
        ...schema,
        properties: {
          newKey: {
            type: 'object',
            anyOf,
            [ADDITIONAL_PROPERTY_FLAG]: true,
          },
        },
      });
    });

    it('should handle null formData for schema which contains additionalProperties', () => {
      const schema: RJSFSchema = {
        additionalProperties: {
          type: 'string',
        },
        type: 'object',
      };

      const formData = null;
      expect(retrieveSchema(testValidator, schema, {}, formData)).toEqual({
        ...schema,
        properties: {},
      });
    });

    it('should priorize local definitions over foreign ones', () => {
      const schema: RJSFSchema = {
        $ref: '#/definitions/address',
        title: 'foo',
      };
      const address: RJSFSchema = {
        type: 'string',
        title: 'bar',
      };
      const rootSchema: RJSFSchema = { definitions: { address } };

      expect(retrieveSchema(testValidator, schema, rootSchema)).toEqual({
        ...address,
        title: 'foo',
      });
    });

    describe('property dependencies', () => {
      describe('false condition', () => {
        it('should not add required properties', () => {
          const schema: RJSFSchema = {
            type: 'object',
            properties: {
              a: { type: 'string' },
              b: { type: 'integer' },
            },
            required: ['a'],
            dependencies: {
              a: ['b'],
            },
          };
          const rootSchema: RJSFSchema = { definitions: {} };
          const formData = {};
          expect(
            retrieveSchema(testValidator, schema, rootSchema, formData)
          ).toEqual({
            type: 'object',
            properties: {
              a: { type: 'string' },
              b: { type: 'integer' },
            },
            required: ['a'],
          });
        });
      });

      describe('true condition', () => {
        describe('when required is not defined', () => {
          it('should define required properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
              dependencies: {
                a: ['b'],
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: '1' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
              required: ['b'],
            });
          });
        });

        describe('when required is defined', () => {
          it('should concat required properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
              required: ['a'],
              dependencies: {
                a: ['b'],
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: '1' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
              required: ['a', 'b'],
            });
          });
        });
      });
    });

    describe('schema dependencies', () => {
      describe('conditional', () => {
        describe('false condition', () => {
          it('should not modify properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
              },
              dependencies: {
                a: {
                  properties: {
                    b: { type: 'integer' },
                  },
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = {};
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
              },
            });
          });
        });

        describe('true condition', () => {
          it('should add properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
              },
              dependencies: {
                a: {
                  properties: {
                    b: { type: 'integer' },
                  },
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: '1' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
            });
          });
          it('should concat required properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
              required: ['a'],
              dependencies: {
                a: {
                  properties: {
                    a: { type: 'string' },
                  },
                  required: ['b'],
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: '1' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
              required: ['a', 'b'],
            });
          });
          it('should not concat enum properties, but should concat `required` properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['FOO', 'BAR', 'BAZ'] },
                b: { type: 'string', enum: ['GREEN', 'BLUE', 'RED'] },
              },
              required: ['a'],
              dependencies: {
                a: {
                  properties: {
                    a: { enum: ['FOO'] },
                    b: { enum: ['BLUE'] },
                  },
                  required: ['a', 'b'],
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: 'FOO' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['FOO'] },
                b: { type: 'string', enum: ['BLUE'] },
              },
              required: ['a', 'b'],
            });
          });
        });

        describe('with $ref in dependency', () => {
          it('should retrieve referenced schema', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
              },
              dependencies: {
                a: {
                  $ref: '#/definitions/needsB',
                },
              },
            };
            const rootSchema: RJSFSchema = {
              definitions: {
                needsB: {
                  properties: {
                    b: { type: 'integer' },
                  },
                },
              },
            };
            const formData = { a: '1' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
                b: { type: 'integer' },
              },
            });
          });
        });

        describe('with $ref in oneOf', () => {
          it('should retrieve referenced schemas', () => {
            // Mock errors so that withExactlyOneSubschema works as expected
            testValidator.setReturnValues({
              data: [
                { errors: [{ stack: 'error' }], errorSchema: {} }, // First oneOf... second !== first
                { errors: [], errorSchema: {} }, // Second oneOf... second === second
              ],
            });
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { enum: ['typeA', 'typeB'] },
              },
              dependencies: {
                a: {
                  oneOf: [
                    { $ref: '#/definitions/needsA' },
                    { $ref: '#/definitions/needsB' },
                  ],
                },
              },
            };
            const rootSchema: RJSFSchema = {
              definitions: {
                needsA: {
                  properties: {
                    a: { enum: ['typeA'] },
                    b: { type: 'number' },
                  },
                },
                needsB: {
                  properties: {
                    a: { enum: ['typeB'] },
                    c: { type: 'boolean' },
                  },
                },
              },
            };
            const formData = { a: 'typeB' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { enum: ['typeA', 'typeB'] },
                c: { type: 'boolean' },
              },
            });
          });
        });
      });

      describe('dynamic', () => {
        describe('false condition', () => {
          it('should not modify properties', () => {
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string' },
              },
              dependencies: {
                a: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' },
                      },
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' },
                      },
                    },
                  ],
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = {};
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string' },
              },
            });
          });
        });

        describe('true condition', () => {
          it('should add `first` properties given `first` data', () => {
            // Mock errors so that withExactlyOneSubschema works as expected
            testValidator.setReturnValues({
              data: [
                { errors: [], errorSchema: {} }, // First dependency... first === first
                { errors: [{ stack: 'error' }], errorSchema: {} }, // Second dependency... second !== first
              ],
            });
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
              },
              dependencies: {
                a: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' },
                      },
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' },
                      },
                    },
                  ],
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: 'int' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
                b: { type: 'integer' },
              },
            });
          });

          it('should add `second` properties given `second` data', () => {
            // Mock errors so that withExactlyOneSubschema works as expected
            testValidator.setReturnValues({
              data: [
                { errors: [{ stack: 'error' }], errorSchema: {} }, // First dependency... first !== second
                { errors: [], errorSchema: {} }, // Second dependency... second === second
              ],
            });
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
              },
              dependencies: {
                a: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' },
                      },
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' },
                      },
                    },
                  ],
                },
              },
            };
            const rootSchema: RJSFSchema = { definitions: {} };
            const formData = { a: 'bool' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
                b: { type: 'boolean' },
              },
            });
          });

          describe('showing/hiding nested dependencies', () => {
            let schema: RJSFSchema;
            let rootSchema: RJSFSchema;
            beforeAll(() => {
              schema = {
                type: 'object',
                dependencies: {
                  employee_accounts: {
                    oneOf: [
                      {
                        properties: {
                          employee_accounts: {
                            const: true,
                          },
                          update_absences: {
                            title: 'Update Absences',
                            type: 'string',
                            oneOf: [
                              {
                                title: 'Both',
                                const: 'BOTH',
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                  update_absences: {
                    oneOf: [
                      {
                        properties: {
                          permitted_extension: {
                            title: 'Permitted Extension',
                            type: 'integer',
                          },
                          update_absences: {
                            const: 'BOTH',
                          },
                        },
                      },
                      {
                        properties: {
                          permitted_extension: {
                            title: 'Permitted Extension',
                            type: 'integer',
                          },
                          update_absences: {
                            const: 'MEDICAL_ONLY',
                          },
                        },
                      },
                      {
                        properties: {
                          permitted_extension: {
                            title: 'Permitted Extension',
                            type: 'integer',
                          },
                          update_absences: {
                            const: 'NON_MEDICAL_ONLY',
                          },
                        },
                      },
                    ],
                  },
                },
                properties: {
                  employee_accounts: {
                    type: 'boolean',
                    title: 'Employee Accounts',
                  },
                },
              };
              rootSchema = { definitions: {} };
            });

            it('should not include nested dependencies that should be hidden', () => {
              // Mock errors so that withExactlyOneSubschema works as expected
              testValidator.setReturnValues({
                data: [
                  { errors: [{ stack: 'error' }], errorSchema: {} }, // employee_accounts oneOf ... - fail
                  { errors: [], errorSchema: {} }, // update_absences first oneOf... success
                  { errors: [{ stack: 'error' }], errorSchema: {} }, // update_absences second oneOf... fail
                  { errors: [{ stack: 'error' }], errorSchema: {} }, // update_absences third oneOf... fail
                ],
              });
              const formData = {
                employee_accounts: false,
                update_absences: 'BOTH',
              };
              expect(
                retrieveSchema(testValidator, schema, rootSchema, formData)
              ).toEqual({
                type: 'object',
                properties: {
                  employee_accounts: {
                    type: 'boolean',
                    title: 'Employee Accounts',
                  },
                },
              });
              expect(consoleWarnSpy).toHaveBeenCalledWith(
                "ignoring oneOf in dependencies because there isn't exactly one subschema that is valid"
              );
            });

            it('should include nested dependencies that should not be hidden', () => {
              // Mock errors so that withExactlyOneSubschema works as expected
              testValidator.setReturnValues({
                data: [
                  { errors: [], errorSchema: {} }, // employee_accounts oneOf... success
                  { errors: [], errorSchema: {} }, // update_absences first oneOf... success
                  { errors: [{ stack: 'error' }], errorSchema: {} }, // update_absences second oneOf... fail
                  { errors: [{ stack: 'error' }], errorSchema: {} }, // update_absences third oneOf... fail
                ],
              });
              const formData = {
                employee_accounts: true,
                update_absences: 'BOTH',
              };
              expect(
                retrieveSchema(testValidator, schema, rootSchema, formData)
              ).toEqual({
                type: 'object',
                properties: {
                  employee_accounts: {
                    type: 'boolean',
                    title: 'Employee Accounts',
                  },
                  permitted_extension: {
                    title: 'Permitted Extension',
                    type: 'integer',
                  },
                  update_absences: {
                    title: 'Update Absences',
                    type: 'string',
                    oneOf: [
                      {
                        title: 'Both',
                        const: 'BOTH',
                      },
                    ],
                  },
                },
              });
            });
          });
        });

        describe('with $ref in dependency', () => {
          it('should retrieve the referenced schema', () => {
            // Mock errors so that withExactlyOneSubschema works as expected
            testValidator.setReturnValues({
              data: [
                { errors: [{ stack: 'error' }], errorSchema: {} }, // First oneOf... fail
                { errors: [], errorSchema: {} }, // Second oneOf... success
              ],
            });
            const schema: RJSFSchema = {
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
              },
              dependencies: {
                a: {
                  $ref: '#/definitions/typedInput',
                },
              },
            };
            const rootSchema: RJSFSchema = {
              definitions: {
                typedInput: {
                  oneOf: [
                    {
                      properties: {
                        a: { enum: ['int'] },
                        b: { type: 'integer' },
                      },
                    },
                    {
                      properties: {
                        a: { enum: ['bool'] },
                        b: { type: 'boolean' },
                      },
                    },
                  ],
                },
              },
            };
            const formData = { a: 'bool' };
            expect(
              retrieveSchema(testValidator, schema, rootSchema, formData)
            ).toEqual({
              type: 'object',
              properties: {
                a: { type: 'string', enum: ['int', 'bool'] },
                b: { type: 'boolean' },
              },
            });
          });
        });
      });
    });

    describe('allOf', () => {
      it('should merge types', () => {
        const schema: RJSFSchema = {
          allOf: [{ type: ['string', 'number', 'null'] }, { type: 'string' }],
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {};
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'string',
        });
      });
      it('should not merge incompatible types', () => {
        const schema: RJSFSchema = {
          allOf: [{ type: 'string' }, { type: 'boolean' }],
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {};
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({});
        expect(consoleWarnSpy).toBeCalledWith(
          expect.stringMatching(/could not merge subschemas in allOf/)
        );
      });
      it('should merge types with $ref in them', () => {
        const schema: RJSFSchema = {
          allOf: [{ $ref: '#/definitions/1' }, { $ref: '#/definitions/2' }],
        };
        const rootSchema: RJSFSchema = {
          definitions: {
            '1': { type: 'string' },
            '2': { minLength: 5 },
          },
        };
        const formData = {};
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'string',
          minLength: 5,
        });
      });
      it('should properly merge schemas with nested allOf`s', () => {
        const schema: RJSFSchema = {
          allOf: [
            {
              type: 'string',
              allOf: [{ minLength: 2 }, { maxLength: 5 }],
            },
            {
              type: 'string',
              allOf: [{ default: 'hi' }, { minLength: 4 }],
            },
          ],
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {};
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'string',
          minLength: 4,
          maxLength: 5,
          default: 'hi',
        });
      });
    });

    describe('Conditional schemas (If, Then, Else)', () => {
      it('should resolve if, then', () => {
        // Mock errors so that resolveCondition works as expected
        testValidator.setReturnValues({
          isValid: [
            true, // First condition Country... USA pass
            false, // Second condition Countery... Canada fail
          ],
        });
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            country: {
              default: 'United States of America',
              enum: ['United States of America', 'Canada'],
            },
          },
          if: {
            properties: { country: { const: 'United States of America' } },
          },
          then: {
            properties: { postal_code: { pattern: '[0-9]{5}(-[0-9]{4})?' } },
          },
          else: {
            properties: {
              postal_code: { pattern: '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]' },
            },
          },
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {
          country: 'United States of America',
          postal_code: '20500',
        };
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'object',
          properties: {
            country: {
              default: 'United States of America',
              enum: ['United States of America', 'Canada'],
            },
            postal_code: { pattern: '[0-9]{5}(-[0-9]{4})?' },
          },
        });
      });
      it('should resolve if, else', () => {
        // Mock errors so that resolveCondition works as expected
        testValidator.setReturnValues({
          isValid: [
            false, // First condition Country... USA fail
          ],
        });
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            country: {
              default: 'United States of America',
              enum: ['United States of America', 'Canada'],
            },
          },
          if: {
            properties: { country: { const: 'United States of America' } },
          },
          then: {
            properties: { postal_code: { pattern: '[0-9]{5}(-[0-9]{4})?' } },
          },
          else: {
            properties: {
              postal_code: { pattern: '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]' },
            },
          },
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {
          country: 'Canada',
          postal_code: 'K1M 1M4',
        };
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'object',
          properties: {
            country: {
              default: 'United States of America',
              enum: ['United States of America', 'Canada'],
            },
            postal_code: { pattern: '[A-Z][0-9][A-Z] [0-9][A-Z][0-9]' },
          },
        });
      });
      it('should resolve multiple conditions', () => {
        // Mock errors so that resolveCondition works as expected
        testValidator.setReturnValues({
          isValid: [
            true, // First condition animal... Cat pass
            false, // Second condition animal... Fish fail
          ],
        });
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            animal: {
              enum: ['Cat', 'Fish'],
            },
          },
          allOf: [
            {
              if: {
                properties: { animal: { const: 'Cat' } },
              },
              then: {
                properties: {
                  food: { type: 'string', enum: ['meat', 'grass', 'fish'] },
                },
              },
              required: ['food'],
            },
            {
              if: {
                properties: { animal: { const: 'Fish' } },
              },
              then: {
                properties: {
                  food: {
                    type: 'string',
                    enum: ['insect', 'worms'],
                  },
                  water: {
                    type: 'string',
                    enum: ['lake', 'sea'],
                  },
                },
                required: ['food', 'water'],
              },
            },
            {
              required: ['animal'],
            },
          ],
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {
          animal: 'Cat',
        };

        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'object',
          properties: {
            animal: {
              enum: ['Cat', 'Fish'],
            },
            food: { type: 'string', enum: ['meat', 'grass', 'fish'] },
          },
          required: ['animal', 'food'],
        });
      });
      it('should resolve multiple conditions in nested allOf blocks', () => {
        // Mock errors so that resolveCondition works as expected
        testValidator.setReturnValues({
          isValid: [
            false, // First condition Animal... Cat fail
            true, // Second condition Animal... Dog pass
            false, // Third condition Breed... Alsatian fail
            true, // Fourth condition Breed... Dalmation pass
          ],
        });
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            Animal: {
              default: 'Cat',
              enum: ['Cat', 'Dog'],
              title: 'Animal',
              type: 'string',
            },
          },
          allOf: [
            {
              if: {
                required: ['Animal'],
                properties: {
                  Animal: {
                    const: 'Cat',
                  },
                },
              },
              then: {
                properties: {
                  Tail: {
                    default: 'Long',
                    enum: ['Long', 'Short', 'None'],
                    title: 'Tail length',
                    type: 'string',
                  },
                },
                required: ['Tail'],
              },
            },
            {
              if: {
                required: ['Animal'],
                properties: {
                  Animal: {
                    const: 'Dog',
                  },
                },
              },
              then: {
                properties: {
                  Breed: {
                    title: 'Breed',
                    properties: {
                      BreedName: {
                        default: 'Alsatian',
                        enum: ['Alsatian', 'Dalmation'],
                        title: 'Breed name',
                        type: 'string',
                      },
                    },
                    allOf: [
                      {
                        if: {
                          required: ['BreedName'],
                          properties: {
                            BreedName: {
                              const: 'Alsatian',
                            },
                          },
                        },
                        then: {
                          properties: {
                            Fur: {
                              default: 'brown',
                              enum: ['black', 'brown'],
                              title: 'Fur',
                              type: 'string',
                            },
                          },
                          required: ['Fur'],
                        },
                      },
                      {
                        if: {
                          required: ['BreedName'],
                          properties: {
                            BreedName: {
                              const: 'Dalmation',
                            },
                          },
                        },
                        then: {
                          properties: {
                            Spots: {
                              default: 'small',
                              enum: ['large', 'small'],
                              title: 'Spots',
                              type: 'string',
                            },
                          },
                          required: ['Spots'],
                        },
                      },
                    ],
                    required: ['BreedName'],
                  },
                },
              },
            },
          ],
          required: ['Animal'],
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {
          Animal: 'Dog',
          Breed: {
            BreedName: 'Dalmation',
          },
        };

        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'object',
          properties: {
            Animal: {
              default: 'Cat',
              enum: ['Cat', 'Dog'],
              title: 'Animal',
              type: 'string',
            },
            Breed: {
              properties: {
                BreedName: {
                  default: 'Alsatian',
                  enum: ['Alsatian', 'Dalmation'],
                  title: 'Breed name',
                  type: 'string',
                },
              },
              allOf: [
                {
                  if: {
                    required: ['BreedName'],
                    properties: {
                      BreedName: {
                        const: 'Alsatian',
                      },
                    },
                  },
                  then: {
                    properties: {
                      Fur: {
                        default: 'brown',
                        enum: ['black', 'brown'],
                        title: 'Fur',
                        type: 'string',
                      },
                    },
                    required: ['Fur'],
                  },
                },
                {
                  if: {
                    required: ['BreedName'],
                    properties: {
                      BreedName: {
                        const: 'Dalmation',
                      },
                    },
                  },
                  then: {
                    properties: {
                      Spots: {
                        default: 'small',
                        enum: ['large', 'small'],
                        title: 'Spots',
                        type: 'string',
                      },
                    },
                    required: ['Spots'],
                  },
                },
              ],
              required: ['BreedName'],
              title: 'Breed',
            },
          },
          required: ['Animal'],
        });
      });
      it('should resolve $ref', () => {
        // Mock errors so that resolveCondition works as expected
        testValidator.setReturnValues({
          isValid: [
            true, // First condition animal... Cat pass
            false, // Second condition animal... Fish fail
          ],
        });
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            animal: {
              enum: ['Cat', 'Fish'],
            },
          },
          allOf: [
            {
              if: {
                properties: { animal: { const: 'Cat' } },
              },
              then: {
                $ref: '#/definitions/cat',
              },
              required: ['food'],
            },
            {
              if: {
                properties: { animal: { const: 'Fish' } },
              },
              then: {
                $ref: '#/definitions/fish',
              },
            },
            {
              required: ['animal'],
            },
          ],
        };

        const rootSchema: RJSFSchema = {
          definitions: {
            cat: {
              properties: {
                food: { type: 'string', enum: ['meat', 'grass', 'fish'] },
              },
            },
            fish: {
              properties: {
                food: {
                  type: 'string',
                  enum: ['insect', 'worms'],
                },
                water: {
                  type: 'string',
                  enum: ['lake', 'sea'],
                },
              },
              required: ['food', 'water'],
            },
          },
        };

        const formData = {
          animal: 'Cat',
        };
        const schemaUtils = createSchemaUtils(testValidator, rootSchema);

        expect(schemaUtils.retrieveSchema(schema, formData)).toEqual({
          type: 'object',
          properties: {
            animal: {
              enum: ['Cat', 'Fish'],
            },
            food: { type: 'string', enum: ['meat', 'grass', 'fish'] },
          },
          required: ['animal', 'food'],
        });
      });
      it('handles nested if then else', () => {
        const schemaWithNested: RJSFSchema = {
          type: 'object',
          properties: {
            country: {
              enum: ['USA'],
            },
          },
          required: ['country'],
          if: {
            properties: {
              country: {
                const: 'USA',
              },
            },
            required: ['country'],
          },
          then: {
            properties: {
              state: {
                type: 'string',
                enum: ['California', 'New York'],
              },
            },
            required: ['state'],
            if: {
              properties: {
                state: {
                  const: 'New York',
                },
              },
              required: ['state'],
            },
            then: {
              properties: {
                city: {
                  type: 'string',
                  enum: ['New York City', 'Buffalo', 'Rochester'],
                },
              },
            },
            else: {
              if: {
                properties: {
                  state: {
                    const: 'California',
                  },
                },
                required: ['state'],
              },
              then: {
                properties: {
                  city: {
                    type: 'string',
                    enum: ['Los Angeles', 'San Diego', 'San Jose'],
                  },
                },
              },
            },
          },
        };

        const rootSchema: RJSFSchema = {};
        const formData = {
          country: 'USA',
          state: 'New York',
        };

        expect(
          retrieveSchema(testValidator, schemaWithNested, rootSchema, formData)
        ).toEqual({
          type: 'object',
          properties: {
            country: {
              enum: ['USA'],
            },
            state: { type: 'string', enum: ['California', 'New York'] },
            city: {
              type: 'string',
              enum: ['New York City', 'Buffalo', 'Rochester'],
            },
          },
          required: ['country', 'state'],
        });
      });
      it('overrides the base schema with a conditional branch when merged', () => {
        const schema: RJSFSchema = {
          type: 'object',
          properties: {
            myString: {
              type: 'string',
              minLength: 5,
            },
          },
          if: true,
          then: {
            properties: {
              myString: {
                minLength: 10, // This value of minLength should override the original value
              },
            },
          },
        };
        const rootSchema: RJSFSchema = { definitions: {} };
        const formData = {};
        expect(
          retrieveSchema(testValidator, schema, rootSchema, formData)
        ).toEqual({
          type: 'object',
          properties: {
            myString: {
              type: 'string',
              minLength: 10,
            },
          },
        });
      });
    });
    describe('resolveSchema()', () => {
      it('defaults rootSchema when missing', () => {
        const schema = {};
        expect(resolveSchema(testValidator, schema)).toEqual(schema);
      });
    });
    describe('withDependentProperties()', () => {
      it('returns the schema when additionally required is falsey', () => {
        const schema: RJSFSchema = { type: 'string' };
        expect(withDependentProperties(schema)).toEqual(schema);
      });
    });
    describe('withExactlyOneSubschema()', () => {
      it('Handle conditions with falsy subschema, subschema.properties, or condition schema', () => {
        const schema: RJSFSchema = {
          type: 'integer',
        };
        const oneOf: RJSFSchema['oneOf'] = [
          true,
          { properties: undefined },
          { properties: { foo: { type: 'string' } } },
        ];
        expect(
          withExactlyOneSubschema(testValidator, schema, schema, 'bar', oneOf)
        ).toEqual(schema);
      });
    });
    describe('stubExistingAdditionalProperties()', () => {
      it('deals with undefined formData', () => {
        const schema: RJSFSchema = { type: 'string' };
        expect(stubExistingAdditionalProperties(testValidator, schema)).toEqual(
          {
            ...schema,
            properties: {},
          }
        );
      });
      it('deals with non-object formData', () => {
        const schema: RJSFSchema = { type: 'string' };
        expect(
          stubExistingAdditionalProperties(testValidator, schema, undefined, [])
        ).toEqual({
          ...schema,
          properties: {},
        });
      });
      it('has property keys that match formData, additionalProperties is boolean', () => {
        const schema: RJSFSchema = {
          additionalProperties: true,
        };
        const formData = { bar: 1, baz: false, foo: 'str' };
        expect(
          stubExistingAdditionalProperties(
            testValidator,
            schema,
            undefined,
            formData
          )
        ).toEqual({
          ...schema,
          properties: {
            bar: {
              type: 'number',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
            baz: {
              type: 'boolean',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
            foo: {
              type: 'string',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
          },
        });
      });
      it('has property keys that match schema AND formData, additionalProperties is boolean', () => {
        const schema: RJSFSchema = {
          properties: {
            foo: { type: 'string' },
            bar: { type: 'number' },
          },
          additionalProperties: true,
        };
        const formData = { foo: 'blah', bar: 1, baz: true };
        expect(
          stubExistingAdditionalProperties(
            testValidator,
            schema,
            undefined,
            formData
          )
        ).toEqual({
          ...schema,
          properties: {
            ...schema.properties,
            baz: {
              type: 'boolean',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
          },
        });
      });
      it('has additionalProperties of type number', () => {
        const schema: RJSFSchema = {
          additionalProperties: { type: 'number' },
        };
        const formData = { bar: 1 };
        expect(
          stubExistingAdditionalProperties(
            testValidator,
            schema,
            undefined,
            formData
          )
        ).toEqual({
          ...schema,
          properties: {
            bar: {
              ...(schema.additionalProperties as object),
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
          },
        });
      });
      it('has additionalProperties of empty object', () => {
        const schema: RJSFSchema = {
          additionalProperties: {},
        };
        const formData = { foo: 'blah', bar: 1, baz: true };
        expect(
          stubExistingAdditionalProperties(
            testValidator,
            schema,
            undefined,
            formData
          )
        ).toEqual({
          ...schema,
          properties: {
            foo: {
              type: 'string',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
            bar: {
              type: 'number',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
            baz: {
              type: 'boolean',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
          },
        });
      });
      it('has additionalProperties with a ref', () => {
        const schema: RJSFSchema = {
          additionalProperties: { $ref: '#/definitions/foo' },
        };
        const rootSchema: RJSFSchema = {
          definitions: {
            foo: { type: 'string' },
          },
        };
        const formData = { bar: 'blah' };
        expect(
          stubExistingAdditionalProperties(
            testValidator,
            schema,
            rootSchema,
            formData
          )
        ).toEqual({
          ...schema,
          properties: {
            bar: {
              type: 'string',
              [ADDITIONAL_PROPERTY_FLAG]: true,
            },
          },
        });
      });
    });
  });
}
