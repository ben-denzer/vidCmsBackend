const express           = require('express');
const adminRouter       = express.Router();
const bodyParser        = require('body-parser');
const jsonParser        = bodyParser.json();
const jwt               = require('jsonwebtoken');
const jwtInfo           = require('../../.jwtinfo').key;
const path              = require('path');
const multer            = require('multer');
const getPlaceholderUrl = require('../services/getPlaceholderUrl');
const getAdminData      = require('../services/getAdminData');
const removeComments    = require('../services/removeComments');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
})
const upload = multer({ storage: storage })

const router = (connection) => {

    adminRouter.post('/uploadBlog', upload.single('image'), (req, res) => {
        const {blogTitleVal, blogHeadlineVal, editorHtml} = req.body;
        if (!blogTitleVal || !editorHtml) return res.status(500).send({error: 'error'});

        connection.query(
            'INSERT INTO blogs(blog_title, blog_headline, blog_text, blog_post_url, blog_date) VALUES(?,?,?,?,curdate())',
            [
                blogTitleVal,
                blogHeadlineVal,
                editorHtml,
                blogTitleVal.split(' ').join('-'),
            ],
            (err, success) => {
                if (err) return res.status(500).send({error: 'Error saving to Database'});
                if (req.file) {
                    connection.query(
                        'INSERT INTO images(blog_fk, image_url) VALUES(?,?)',
                        [success.insertId, req.file.filename],
                        (err, done) => {
                            if (err) return res.status(500).send({error: 'Error saving to Database'});
                            res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                        }
                    );
                } else {
                    res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                }
            }
        );
    });

    adminRouter.post('/uploadPremium', upload.single('video'), (req, res) => {
        const {videoTitleVal, videoHeadlineVal, editorHtml} = req.body;
        if (!videoTitleVal || !req.file) return res.status(500).send({error: 'error'});

        connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url, premium, video_date) VALUES(?,?,?,?,?,curdate())',
            [
                videoTitleVal,
                videoHeadlineVal,
                editorHtml,
                req.file.filename,
                true
            ],
            (err, success) => {
                if (err) return res.status(500).send({error: 'Error saving to Database'});
                res.status(200).send(JSON.stringify({success: 'file uploaded'}));
            }
        );
    });

    adminRouter.post('/uploadFree', jsonParser, (req, res) => {
        const {videoTitleVal ,videoHeadlineVal, editorHtml, youtubeUrlVal, placeholderUrl} = req.body;
        if (!videoTitle || !youtubeUrlVal) return res.status(500).send({error: 'error'});

        getPlaceholderUrl(placeholderUrl, (err, placeholder_url) => {
            connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url,'
            + 'premium, placeholder_url, video_date) VALUES(?,?,?,?,?,?,curdate())',
                [
                    videoTitleVal,
                    videoHeadlineVal,
                    editorHtml,
                    youtubeUrlVal,
                    false,
                    placeholder_url
                ],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'Error saving to Database'});
                    res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                }
            );
        });
    });

    adminRouter.post('/getData', jsonParser, (req, res) => {
        jwt.verify(req.body.token, jwtInfo, (err, user) => {
            if (err) return res.status(500).send({error: 'auth error'});
            if (!user) return res.status(403).send({error: 'unauthorized'});
            getAdminData(connection, (err, data) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify({adminData: data}));
            })
        });
    });

    adminRouter.post('/deleteComments', jsonParser, (req, res) => {
        jwt.verify(req.body.token, jwtInfo, (err, user) => {
            if (err) return res.status(500).send({error: 'auth error'});
            if (!user) return res.status(403).send({error: 'unauthorized'});
            removeComments(connection, req.body.trash, (err, success) => {
                if (err) return res.status(500).send({error: 'DB Error'});
                res.status(200).send({success: 'Comments Removed'});
            });
        });
    });

    return adminRouter;
};

module.exports = router;