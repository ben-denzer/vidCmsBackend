const express = require('express');
const publicRouter = express.Router();
const jsonParser = require('body-parser').json();

const router = (connection) => {
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

    publicRouter.post('/getComments', jsonParser, (req, res) => {
        console.log(req.body.video_id, 'id');
        connection.query(
            'SELECT u.username, c.comment_text, c.comment_date FROM comments c JOIN users u ON c.user_fk=u.user_id JOIN videos v ON c.video_fk=video_id WHERE c.video_fk=?',
            [req.body.video_id],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'db error'});
                res.status(200).send(JSON.stringify(rows));
            }
        )
    });

    return publicRouter;
};

module.exports = router;