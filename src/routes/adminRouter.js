const express       = require('express');
const adminRouter   = express.Router();
const jsonParser    = require('body-parser').json();
const jwt           = require('jsonwebtoken');
const jwtInfo       = require('../../.jwtinfo').key;
const path          = require('path');
const multer        = require('multer');

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
    adminRouter.post('/uploadPremium', upload.single('video'), (req, res) => {
        connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url, premium) VALUES(?,?,?,?,?)',
            [
                req.body.videoTitleVal,
                req.body.videoHeadlineVal,
                req.body.editorHtml,
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
        connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url, premium) VALUES(?,?,?,?,?)',
            [
                req.body.videoTitleVal,
                req.body.videoHeadlineVal,
                req.body.editorHtml,
                req.body.youtubeUrlVal,
                false
            ],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'Error saving to Database'});
                res.status(200).send(JSON.stringify({success: 'file uploaded'}));
            }
        );
    });

    return adminRouter;
};

module.exports = router;