const mocha = require('mocha');
const assert = require('assert');
const request = require('request');
const baseUrl = 'http://localhost:3005/';
const getPlaceholderUrl = require('./getPlaceholderUrl');

describe('GET PLACEHOLDER URL', function() {
    it ('should return a string', function(done) {
        getPlaceholderUrl('<iframe width="560" height="315" src="https://www.youtube.com/embed/CTlqmmzlDB0" frameborder="0" allowfullscreen></iframe>', (err, data) => {
            assert.equal(null, err);
            assert.equal('string', typeof data);
            done();
        });
    });

    it ('should return correct url', function(done) {
        getPlaceholderUrl('<iframe width="560" height="315" src="https://www.youtube.com/embed/CTlqmmzlDB0" frameborder="0" allowfullscreen></iframe>', (err, data) => {
            assert.equal(null, err);
            assert.equal('https://www.youtube.com/embed/CTlqmmzlDB0', data);
            done();
        });
    });

    it ('should error out when needed', function(done) {

    });
});
