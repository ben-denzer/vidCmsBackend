const mocha = require('mocha');
const assert = require('assert');
const request = require('request');
const app = require('../../app');
const baseUrl = 'http://localhost:3005/';

const baseRouteTest = (description, url) => {
    describe(description, function() {
        it('should return 200', function(done) {
            request.get(`${baseUrl}public${url}`, function(err, res, body) {
                assert.equal(200, res.statusCode);
                done();
            });
        });

        it('should return a string', function(done) {
            request.get(`${baseUrl}public/${url}`, function(err, res, body) {
                assert.equal('string', typeof body);
                done();
            });
        });
    });
}


module.exports = describe('PUBLIC ROUTER', function() {
    baseRouteTest('GET ALL BLOGS', '/getAllBlogs');
    baseRouteTest('GET ALL COMMENTS', '/getAllComments');
    baseRouteTest('GET ALL IMAGES', '/getAllImages');
    baseRouteTest('GET ALL VIDEOS', '/getAllVideos');
    baseRouteTest('GET BLOG COMMENTS', '/getBlogComments');
    // baseRouteTest('GET FREE VIDEO', '/getFreeVideo');
    baseRouteTest('GET VIDEO COMMENTS', '/getVideoComments');
});
