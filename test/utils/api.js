/*jshint expr: true*/
var assert = require('assert'),
  should = require('should');
require('../../app/models/api');
var apiUtil = require('../../app/utils/api');

describe('utils', function(){
  describe('api', function(){
    describe('normalizeKeys', function(){
      var normalizeKeys = apiUtil.normalizeKeys;
      it('should throw error when field is missing.', function(){
        normalizeKeys.bind(null, { }).should.throw();
        normalizeKeys.bind(null, { namespace: "com.amoeba" }).should.throw();
        normalizeKeys.bind(null, { path: "/path/to/resource" }).should.throw();
        normalizeKeys.bind(null, { namespace: "com.amoeba", path: 1 }).should.throw();
        normalizeKeys.bind(null, { namespace: "", path: "/path/to/resource" }).should.throw();
      });
      it('should throw error when field is invalid.', function(){
        normalizeKeys.bind(null, { namespace: "com.amoeba", path: '?' }).should.throw();
        normalizeKeys.bind(null, { namespace: "com-amoeba", path: "/path/to/resource" }).should.throw();
      });
      it('should return the origin valid api.', function(){
        normalizeKeys({ namespace: "com.amoeba", path: "/path/to/resource" }).should.eql({ namespace: "com.amoeba", path: "/path/to/resource" });
      });
      it('should add a leading \'/\' for path when missing.', function(){
        normalizeKeys({ namespace: "com.amoeba", path: "path/to/resource" }).path.should.eql('/path/to/resource');
      });
      it('should drop the last \'/\' for path when presents.', function(){
        normalizeKeys({ namespace: "com.amoeba", path: "/path/to/resource/" }).path.should.eql('/path/to/resource');
      });
      it('support \'\' path.', function(){
        normalizeKeys({ namespace: "com.amoeba", path: '' }).path.should.eql('/');
      });
    });

    var sampleApi = {
      path: '/path/to/resource',
      namespace: 'com.amoeba',
      description: 'Description',
      route: 'Route',
      __v: 1
    };
    var resultApi;
    describe('dropKeys', function(){
      var dropKeys = apiUtil.dropKeys;
      it('should drop namespace and path', function(){
        resultApi = dropKeys(sampleApi);
        (resultApi.namespace === undefined).should.be.true;
        (resultApi.path === undefined).should.be.true;
      });
    });
  });
});
