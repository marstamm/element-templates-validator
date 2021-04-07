import { expect } from 'chai';

import { map, keys } from 'min-dash';

import * as validator from '../..';


describe('Validator', function() {

  describe('#getSchemaVersion', function() {

    it('should return schema version', function() {

      // then
      expect(validator.getSchemaVersion()).to.eql(
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
      } = validator.validate(sample);

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
      } = validator.validate(sample);

      console.error(JSON.stringify(errors, null, 2));

      const normalizedErrors = normalizeErrors(errors);

      // then
      expect(valid).to.be.false;
      expect(object).to.equal(sample);

      expect(normalizedErrors).to.eql([
        { message: 'should be object', params: { type: 'object' } },
        { message: 'should be string', params: { type: 'string' } },
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
      } = validator.validate(sample);

      const error = errors[0];

      // then
      expect(error.dataPointer).to.eql({
        value: { line: 0, column: 0, pos: 0 },
        valueEnd: { line: 177, column: 1, pos: 4825 }
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
      } = validator.validateAll(samples);

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
      } = validator.validateAll(samples);

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
      } = validator.validateAll(samples);

      // then
      const validObjects = results.filter(r => r.valid).map(r => r.object);

      expect(validObjects).to.eql([
        samples[3],
        samples[4],
        samples[5]
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