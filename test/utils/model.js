/*jshint expr: true*/
var assert = require('assert'),
  should = require('should'),
  modelUtil = require('../../app/utils/model');

describe('utils', function(){
  describe('model', function(){

    var sampleApi = {
      path: '/path/to/resource',
      namespace: 'com.amoeba',
      description: 'Description',
      route: 'Route',
      __v: 1
    };
    var resultApi;
    describe('dropDbInfo', function(){
      var dropDbInfo = modelUtil.dropDbInfo;
      it('should drop _id and __v', function(){
        resultApi = dropDbInfo(sampleApi);
        (resultApi.__v === undefined).should.be.true;
        (resultApi._id === undefined).should.be.true;
      });
    });

  });
});
