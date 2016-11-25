const express = require('express');
const publicRouter = express.Router();
const jsonParser = require('body-parser').json();

const router = (connection) => {
    publicRouter.post('/getAllVideos', (req, res) => {
        connection.query(
            'SELECT v.video_id, v.video_title, v.video_url, v.video_text, v.video_headline, v.premium FROM videos v WHERE v.video_id > 0',
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

    return publicRouter;
};

module.exports = router;