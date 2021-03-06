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
const verifyAdmin       = require('../services/verifyAdmin');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });

const router = (connection) => {

    adminRouter.post('/banUser', jsonParser, (req, res) => {
        verifyAdmin(connection, req.body.token, (err, user) => {
            if (err || !user) return res.status(401).send({error: 'unauthorized'});
            connection.query(
                'UPDATE users SET banned_user = true WHERE user_id = ?',
                [req.body.bannedUser],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'server error'});

                    connection.query(
                        'DELETE FROM comments WHERE user_fk = ?',
                        [req.body.bannedUser],
                        (err, rows) => {
                            if (err) return res.status(500).send({error: 'server error'});
                            res.status(200).send({success: 'user banned'});
                        }
                    );
                }
            )
        })
    });

    adminRouter.post('/editBlog', jsonParser, (req, res) => {
        const {blogId, editorHtml, token, seoDescriptionVal, uploadTitleVal, uploadHeadlineVal} = req.body;
        verifyAdmin(connection, token, (err, user) => {
            if (err || !user) return res.status(401).send({error: 'unauthorized'});
            connection.query(
                'UPDATE blogs SET blog_title=?, blog_headline=?, blog_seo_description=?, blog_text=? WHERE blog_id=?',
                [
                    uploadTitleVal,
                    uploadHeadlineVal,
                    seoDescriptionVal,
                    editorHtml,
                    blogId
                ],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'server error'});
                    res.status(200).send({success: 'Updated Post'});
                }
            )
        });
    });

    adminRouter.post('/editImage', upload.single('image'), (req, res) => {
        const {blogId, token} = req.body;
        verifyAdmin(connection, token, (err, user) => {
            connection.query(
                'DELETE FROM images WHERE blog_fk=?',
                [blogId],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'server error'});

                    connection.query(
                        'INSERT INTO images(blog_fk, image_url) VALUES(?,?)',
                        [blogId, req.file.filename],
                        (err, success) => {
                            if (err) return res.status(500).send({error: 'server error'});
                            res.status(200).send(JSON.stringify({success: 'image changed'}));
                        }
                    );
                }
            );
        });
    });

    adminRouter.post('/uploadBlog', upload.single('image'), (req, res) => {
        const {editorHtml, token, seoDescriptionVal, uploadTitleVal, uploadHeadlineVal} = req.body;

        verifyAdmin(connection, token, (err, user) => {
            if (err || !user) return res.status(401).send({error: 'unauthorized'});

            const blogPostUrl = uploadTitleVal.split(' ').join('-');
            if (!uploadTitleVal || !editorHtml) return res.status(500).send({error: 'server error'});

            connection.query(
                'INSERT INTO blogs(blog_title, blog_headline, blog_seo_description, blog_text, blog_post_url, blog_date) VALUES(?,?,?,?,?,curdate())',
                [
                    uploadTitleVal,
                    uploadHeadlineVal,
                    seoDescriptionVal,
                    editorHtml,
                    blogPostUrl,
                ],
                (err, success) => {
                    if (err) console.log(err);
                    if (err) return res.status(500).send({error: 'server error'});
                    if (req.file) {
                        connection.query(
                            'INSERT INTO images(blog_fk, image_url) VALUES(?,?)',
                            [success.insertId, req.file.filename],
                            (err, done) => {
                                if (err) return res.status(500).send({error: 'server error'});
                                res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                            }
                        );
                    } else {
                        res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                    }
                }
            );
        });
    });

    adminRouter.post('/uploadPremium', upload.single('video'), (req, res) => {
        const {editorHtml, token, uploadTitleVal, uploadHeadlineVal} = req.body;

        verifyAdmin(connection, token, (err, user) => {
            if (err || !user) return res.status(401).send({error: 'unauthorized'});

            if (!uploadTitleVal || !req.file) return res.status(500).send({error: 'server error'});
            connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url, premium, video_date) VALUES(?,?,?,?,?,curdate())',
                [
                    uploadTitleVal,
                    uploadHeadlineVal,
                    editorHtml,
                    req.file.filename,
                    true
                ],
                (err, success) => {
                    if (err) return res.status(500).send({error: 'server error'});
                    res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                }
            );
        });
    });

    adminRouter.post('/uploadFree', jsonParser, (req, res) => {
        const {
            editorHtml,
            placeholderUrl,
            token,
            uploadTitleVal,
            uploadHeadlineVal,
            youtubeUrlVal
        } = req.body;

        verifyAdmin(connection, token, (err, user) => {
            if (err || !user) return res.status(401).send({error: 'unauthorized'});
            if (!uploadTitleVal || !youtubeUrlVal) return res.status(500).send({error: 'error'});

            getPlaceholderUrl(placeholderUrl, (err, placeholder_url) => {
                connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url,'
                + 'premium, placeholder_url, video_date) VALUES(?,?,?,?,?,?,curdate())',
                    [
                        uploadTitleVal,
                        uploadHeadlineVal,
                        editorHtml,
                        youtubeUrlVal,
                        false,
                        placeholder_url
                    ],
                    (err, rows) => {
                        if (err) return res.status(500).send({error: 'server error'});
                        res.status(200).send(JSON.stringify({success: 'file uploaded'}));
                    }
                );
            });
        });
    });

    adminRouter.post('/getData', jsonParser, (req, res) => {
        verifyAdmin(connection, req.body.token, (err, user) => {
            if (err) return res.status(500).send({error: 'server error'});
            if (!user) return res.status(403).send({error: 'unauthorized'});

            getAdminData(connection, (err, adminData) => {
                if (err) return res.status(500).send({error: 'server error'});
                res.status(200).send(JSON.stringify(adminData));
            })
        });
    });

    adminRouter.post('/deleteComments', jsonParser, (req, res) => {
        verifyAdmin(connection, req.body.token, (err, user) => {
            if (err) return res.status(500).send({error: 'server error'});
            if (!user) return res.status(403).send({error: 'unauthorized'});

            removeComments(connection, req.body.trash, (err, success) => {
                if (err) return res.status(500).send({error: 'server error'});
                res.status(200).send({success: 'Comments Removed'});
            });
        });
    });

    return adminRouter;
};

module.exports = router;
