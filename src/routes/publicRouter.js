const express = require('express');
const publicRouter = express.Router();
const jsonParser = require('body-parser').json();

const router = (connection) => {

    publicRouter.post('/getAllBlogs', (req, res) => {
        connection.query(
            'SELECT b.blog_id, b.blog_title, b.blog_headline, b.blog_text, b.blog_date, blog_post_url FROM blogs b ORDER BY blog_date DESC',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.post('/getAllImages', (req, res) => {
        connection.query(
            'SELECT i.image_id, i.blog_fk, i.image_url FROM images i',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.post('/getAllVideos', (req, res) => {
        connection.query(
            'SELECT v.video_id, v.video_title, v.video_url, v.video_text, v.video_headline,'
            + 'v.premium, v.video_date, v.placeholder_url FROM videos v ORDER BY video_date DESC',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.post('/getFreeVideo', jsonParser, (req, res) => {
        connection.query(
            'SELECT v.video_title, v.video_headline, v.video_url, v.video_text FROM videos v WHERE v.video_id = ?',
            [req.body.id],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.post('/getBlogComments', jsonParser, (req, res) => {
        connection.query(
            'SELECT u.username, c.comment_text, c.comment_date FROM comments c JOIN users u ON c.user_fk=u.user_id JOIN blogs b ON c.blog_fk=blog_id WHERE c.blog_fk=?',
            [req.body.blog_id],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.post('/getVideoComments', jsonParser, (req, res) => {
        connection.query(
            'SELECT u.username, c.comment_text, c.comment_date FROM comments c JOIN users u ON c.user_fk=u.user_id JOIN videos v ON c.video_fk=video_id WHERE c.video_fk=?',
            [req.body.video_id],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    return publicRouter;
};

module.exports = router;