const mocha = require('mocha');
const assert = require('assert');
const request = require('request');
const app = require('../../app');
const baseUrl = 'http://localhost:3005/'
const publicRouter = require('../routes/publicRouter.test');

describe('FIRST TESTS', function() {
    describe('GET ALL BLOGS', function() {
        it ('should return 200', function(done) {
            request.get(`${baseUrl}public/getAllBlogs`, function(err, res, body) {
                assert.equal(200, res.statusCode);
                done();
            });
        });

        it ('should return a string', function(done) {
            request.get(`${baseUrl}public/getAllBlogs`, function(err, res, body) {
                assert.equal('string', typeof body);
                done();
            });
        });


        it ('should close the server', function(done) {
            app.closeServer();
            done();
        });
    });
});
