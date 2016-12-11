const express       = require('express');
const adminRouter   = express.Router();
const bodyParser    = require('body-parser');
const jsonParser    = bodyParser.json();
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
        connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url, premium, video_date) VALUES(?,?,?,?,?,curdate())',
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
        connection.query('INSERT INTO videos(video_title, video_headline, video_text, video_url, premium, video_date) VALUES(?,?,?,?,?,curdate())',
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

    adminRouter.post('/getData', jsonParser, (req, res) => {
        console.log('adminRouter', req.body);
        jwt.verify(req.body.token, jwtInfo, (err, user) => {
            if (err) return res.status(500).send({error: 'auth error'});
            if (!user) return res.status(403).send({error: 'unauthorized'});
            return res.status(200).send({success: 'vs'});
        });
    });

    return adminRouter;
};

module.exports = router;