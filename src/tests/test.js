const mocha = require('mocha');
const assert = require('assert');
const request = require('request');
const app = require('../../app');
const baseUrl = 'http://localhost:3005/';

// Routes
const publicRouter = require('../routes/publicRouter.test');

// Services
const getPlaceholderUrl = require('../services/getPlaceholderUrl.test');

describe('BASE', function() {
    it ('should close the server', function(done) {
        app.closeServer();
        done();
    });
});
