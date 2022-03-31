import { expect } from 'chai';

import { map, keys } from 'min-dash';

import {
  getSchemaPackage,
  getSchemaVersion,
  validate,
  validateAll,
  getZeebeSchemaPackage,
  getZeebeSchemaVersion,
  validateZeebe,
  validateAllZeebe
} from '../..';


describe('Validator', function() {


  describe('#getSchemaPackage', function() {

    it('should return schema package', function() {

      // then
      expect(getSchemaPackage()).to.eql(
        require('@camunda/element-templates-json-schema/package.json').name);
    });
  });


  describe('#getSchemaVersion', function() {

    it('should return schema version', function() {

      // then
      expect(getSchemaVersion()).to.eql(
        require('@camunda/element-templates-json-schema/package.json').version);
    });
  });


  describe('#validate', function() {

    it('should validate', function() {

      // given
      const sample = require('../fixtures/rpa.json');

      // when
      const {
        errors,
        object,
        valid
      } = validate(sample);

      // then
      expect(valid).to.be.true;
      expect(object).to.equal(sample);
      expect(errors).not.to.exist;
    });


    it('should retrieve errors', function() {

      // given
      const sample = require('../fixtures/rpa-broken.json');

      // when
      const {
        errors,
        object,
        valid
      } = validate(sample);

      const normalizedErrors = normalizeErrors(errors);

      // then
      expect(valid).to.be.false;
      expect(object).to.equal(sample);

      expect(normalizedErrors).to.eql([
        { message: 'should be object', params: { type: 'object' } },
        { message: 'should be string', params: { type: 'string' } },
        { message: 'invalid item for "elementType", should contain namespaced property, example: "bpmn:Task"' },
        { message: 'should match exactly one schema in oneOf',
          params: { passingSchemas: null } }
      ]);
    });


    it('should set data pointer', function() {

      // given
      const sample = require('../fixtures/rpa-broken.json');

      // when
      const {
        errors,
      } = validate(sample);

      const error = errors[0];

      // then
      expect(error.dataPointer).to.eql({
        value: { line: 0, column: 0, pos: 0 },
        valueEnd: { line: 180, column: 1, pos: 4877 }
      });
    });
  });


  describe('#validateAll', function() {

    it('should validate without errors', function() {

      // given
      const samples = require('../fixtures/multiple.json');

      // when
      const {
        valid,
        results
      } = validateAll(samples);

      // then
      expect(valid).to.be.true;
      expect(results.length).to.eql(samples.length);

      expect(results.every(r => r.valid)).to.be.true;

      expect(results.map(r => r.object)).to.eql(samples);
    });


    it('should validate with errors', function() {

      // given
      const samples = require('../fixtures/multiple-errors.json');

      // when
      const {
        valid,
        results
      } = validateAll(samples);

      // then
      expect(valid).to.be.false;

      expect(results.map(r => r.valid)).to.eql([
        false, false, false, true, true, true, false
      ]);

      expect(results.map(r => r.object)).to.eql(samples);
    });


    it('should provide all valid objects', function() {

      // given
      const samples = require('../fixtures/multiple-errors.json');

      // when
      const {
        results
      } = validateAll(samples);

      // then
      const validObjects = results.filter(r => r.valid).map(r => r.object);

      expect(validObjects).to.eql([
        samples[3],
        samples[4],
        samples[5]
      ]);
    });

  });


  describe('#getZeebeSchemaPackage', function() {

    it('should return schema package', function() {

      // then
      expect(getZeebeSchemaPackage()).to.eql(
        require('@camunda/zeebe-element-templates-json-schema/package.json').name);
    });
  });


  describe('#getZeebeSchemaVersion', function() {

    it('should return schema version', function() {

      // then
      expect(getZeebeSchemaVersion()).to.eql(
        require('@camunda/zeebe-element-templates-json-schema/package.json').version);
    });
  });


  describe('#validateZeebe', function() {

    it('should validate', function() {

      // given
      const sample = require('../fixtures/rest-connector.json');

      // when
      const {
        errors,
        object,
        valid
      } = validateZeebe(sample);

      // then
      expect(valid).to.be.true;
      expect(object).to.equal(sample);
      expect(errors).not.to.exist;
    });


    it('should retrieve errors', function() {

      // given
      const sample = require('../fixtures/rest-connector-broken.json');

      // when
      const {
        errors,
        object,
        valid
      } = validateZeebe(sample);

      const normalizedErrors = normalizeErrors(errors);

      // then
      expect(valid).to.be.false;
      expect(object).to.equal(sample);

      expect(normalizedErrors).to.eql([
        {
          message: 'invalid item for "elementType", should contain namespaced property, example: "bpmn:Task"'
        },
        {
          message: 'must provide choices=[] with "Dropdown" type'
        },
        {
          message: 'invalid property.binding type "zeebe:taskDefinition:foo"; must be any of { property, zeebe:taskDefinition:type, zeebe:input, zeebe:output, zeebe:taskHeader }'
        },
        {
          message: 'property.binding "zeebe:taskHeader" requires key'
        },
        {
          message: 'feel is only supported for "String" and "Text" type'
        },
        {
          message: 'should be equal to one of the allowed values',
          params: {
            allowedValues: [
              null,
              'optional',
              'required'
            ]
          }
        },
        {
          message: 'optional is not allowed for truthy "notEmpty" constraint'
        },
        {
          message: 'Malformed icon source, must be a valid HTTP(s) or data URL'
        },
        { message: 'should be array', params: { type: 'array' } },
        {
          message: 'should match exactly one schema in oneOf',
          params: { passingSchemas: null }
        }
      ]);
    });


    it('should set data pointer', function() {

      // given
      const sample = require('../fixtures/rest-connector-broken.json');

      // when
      const {
        errors,
      } = validateZeebe(sample);

      const error = errors[2];

      // then
      expect(error.dataPointer).to.eql({
        key: { line: 12, column: 8, pos: 267 },
        keyEnd: { line: 12, column: 14, pos: 273 },
        value: { line: 12, column: 16, pos: 275 },
        valueEnd: { line: 12, column: 42, pos: 301 }
      });
    });
  });


  describe('#validateAllZeebe', function() {

    it('should validate without errors', function() {

      // given
      const samples = require('../fixtures/multiple-connectors.json');

      // when
      const {
        valid,
        results
      } = validateAllZeebe(samples);

      // then
      expect(valid).to.be.true;
      expect(results.length).to.eql(samples.length);

      expect(results.every(r => r.valid)).to.be.true;

      expect(results.map(r => r.object)).to.eql(samples);
    });


    it('should validate with errors', function() {

      // given
      const samples = require('../fixtures/multiple-connectors-errors.json');

      // when
      const {
        valid,
        results
      } = validateAllZeebe(samples);

      // then
      expect(valid).to.be.false;

      expect(results.map(r => r.valid)).to.eql([
        false, true, false, true
      ]);

      expect(results.map(r => r.object)).to.eql(samples);
    });


    it('should provide all valid objects', function() {

      // given
      const samples = require('../fixtures/multiple-connectors-errors.json');

      // when
      const {
        results
      } = validateAllZeebe(samples);

      // then
      const validObjects = results.filter(r => r.valid).map(r => r.object);

      expect(validObjects).to.eql([
        samples[1],
        samples[3]
      ]);
    });

  });

});


// helper //////////////

function normalizeErrors(errors) {
  if (!errors) {
    return;
  }

  return map(errors, function(error) {

    let normalizedError = {
      message: error.message
    };

    // ignore raw errors generated by ajv (in case of custom errorMessage)
    const params = error.params;

    if (params) {

      if (params.rawErrors) {
        delete params.rawErrors;
      }

      if (keys(params).length) {
        normalizedError.params = params;
      }
    }

    return normalizedError;
  });
}