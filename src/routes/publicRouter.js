const express       = require('express');
const publicRouter  = express.Router();
const jsonParser    = require('body-parser').json();

const router = (connection) => {

    publicRouter.get('/getAllBlogs', (req, res) => {
        connection.query(
            'SELECT b.blog_id, b.blog_title, b.blog_headline, b.blog_text, b.blog_date, blog_post_url FROM blogs b ORDER BY blog_date DESC',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.get('/getAllComments', (req, res) => {
        connection.query(
            'SELECT c.comment_id, c.comment_text, c.user_fk, c.comment_date, c.blog_fk, c.video_fk, '
            + 'u.username FROM comments c INNER JOIN users u ON c.user_fk = u.user_id '
            + 'ORDER BY comment_date',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        )
    });

    publicRouter.get('/getAllImages', (req, res) => {
        connection.query(
            'SELECT i.image_id, i.blog_fk, i.image_url FROM images i',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.get('/getAllVideos', (req, res) => {
        connection.query(
            'SELECT v.video_id, v.video_title, v.video_url, v.video_text, v.video_headline,'
            + 'v.premium, v.video_date, v.placeholder_url FROM videos v ORDER BY video_date DESC',
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.get('/getBlogComments', jsonParser, (req, res) => {
        connection.query(
            'SELECT u.username, c.comment_text, c.comment_date FROM comments c JOIN users u ON c.user_fk=u.user_id JOIN blogs b ON c.blog_fk=b.blog_post_url WHERE c.blog_fk=?',
            [req.body.blog_post_url],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.get('/getFreeVideo', jsonParser, (req, res) => {
        connection.query(
            'SELECT v.video_title, v.video_headline, v.video_url, v.video_text FROM videos v WHERE v.video_id = ?',
            [req.body.id],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        );
    });

    publicRouter.get('/getVideoComments', jsonParser, (req, res) => {
        connection.query(
            'SELECT u.username, c.comment_text, c.comment_date FROM comments c JOIN users u ON c.user_fk=u.user_id JOIN videos v ON c.video_fk=video_title WHERE v.video_id=?',
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
