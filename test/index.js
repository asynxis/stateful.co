'use strict';
var should  = require('should')
  , sinon   = require('sinon')
  , nock    = require('nock')
  , _       = require('lodash')
  , stub    = sinon.stub
  , counter = require("index.js")("test","test","test")
  ;


function promisify(err, data) {
  return function () {
    return new Promise(function (resolve, reject) {
      return err
        ? reject(err)
        : resolve(data);
    });
  }
}

describe('Stateful', function () {

  describe("getId", function () {

    it("should return id", function () {
      stub(counter,"sendRequest",promisify(null,7));
      counter.getId().then(function (id) {
        id.should.be.equal(7);
      });
      counter.sendRequest.restore();
    });

    it("should fire error in some network problem", function () {
      stub(counter,"sendRequest",promisify(new Error("test")));
      counter.getId().catch(function (error) {
        error.toString().should.equal("Error: test");
      });
      counter.sendRequest.restore();
    });

  });

  describe("sendRequest", function () {

    it("should return id", function () {

      nock('http://www.stateful.co')
        .get('/c/test/inc?value=1')
        .reply(200, 89);

      counter.sendRequest("GET","inc?value=1").then(function (id) {
        id.should.be.equal('89');
      });

      nock('http://www.stateful.co')
        .get('/c/test/inc?value=1')
        .reply(200, 89);

      counter.sendRequest("GET","inc?value=1",200).then(function (id) {
        id.should.be.equal('89');
      });

    });

    it("should return error", function () {

      nock('http://www.stateful.co')
        .get('/c/test/inc?value=1')
        .reply(500, "Error");

      counter.sendRequest("GET","inc?value=1",200).catch(function (error) {
        error.toString().should.be.equal("Error: Empty response");
      });

      nock('http://www.stateful.co')
        .get('/c/test/inc?value=1')
        .replyWithError('something awful happened');

      counter.sendRequest("GET","inc?value=1",200).catch(function (error) {
        error.toString().should.be.equal("Error: something awful happened");
      });

    });

  });
  
});
