const express           = require('express');
const bodyParser        = require('body-parser');
const jsonParser        = bodyParser.json();
const signupLogic       = require('../config/signupLogic');
const authRouter        = express.Router();
const passport          = require('passport');
const jwt               = require('jsonwebtoken');
const jwtInfo           = require('../../.jwtinfo').key;
const sendPasswordReset = require('../services/sendPasswordReset');
const resetPw           = require('../services/resetPw');

const router = (connection) => {
    authRouter.post('/signup', jsonParser, (req, res) => {
        signupLogic(req, connection, (err, token) => {
            if (err) return res.status(500).send(err);
            if (token.error === 'username is taken') return res.status(403).send({error: 'username is taken'});
            res.status(200).send(JSON.stringify({token}));
        });
    });

    authRouter.post('/login', jsonParser, passport.authenticate('local'), (req, res) => {
        res.status(200).send(JSON.stringify(req.user));
    });

    authRouter.post('/getPremiumVideo', jsonParser, (req, res) => {
        const {video_id, token} = req.body;
        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user || !user.premium) return res.status(403).send({error: 'unauthorized'});
            connection.query(
                'SELECT v.video_title, v.video_headline, v.video_url, v.video_text FROM videos v WHERE v.video_id = ?',
                [video_id],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'db error'});
                    res.status(200).send(JSON.stringify(rows));
                }
            );
        });
    });

    authRouter.post('/loginWithToken', jsonParser, (req, res) => {
        jwt.verify(req.body.token, jwtInfo, (err, user) => {
            if (err) return res.status(500).send({error: 'session expired, please log in again'});
            connection.query('SELECT u.username, u.premium, u.admin FROM users u WHERE u.user_id=?',
                [user.user_id],
                (err, rows) => {
                    if (err) return res.status(500).send();
                    res.status(200).send(JSON.stringify({
                        username:   rows[0].username,
                        premium:    rows[0].premium,
                        admin:      rows[0].admin,
                        token:      req.body.token
                    }));
                }
            );
        });
    });

    authRouter.post('/resetPassword', jsonParser, (req, res) => {
        sendPasswordReset(req.body.email, connection, (err, data) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(200).send({success: 'email sent', data});
        });
    });

    authRouter.post('/reset/:token', jsonParser, (req, res) => {
        const token = req.params.token;
        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user) return res.status(403).send({error: 'unauthorized'});
            resetPw(req, connection, (err, data) => {
                if (err) return res.status(500).send(JSON.stringify({error: err}));
                res.status(200).send(data);
            });
        });
    });

    authRouter.post('/submitComment', jsonParser, (req, res) => {
        const token = req.body.token;
        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user) return res.status(403).send({error: 'unauthorized'});
            connection.query(
                'INSERT INTO comments(comment_text, user_fk, video_fk) VALUES(?,?,?)',
                [req.body.comment, user.user_id, req.body.video],
                (err, success) => {
                    if (err) return res.send(JSON.stringify({error: 'db error'}));
                    res.status(200).send(JSON.stringify({success: 'comment added'}));
                }
            );
        });
    });

    return authRouter;
};

module.exports = router;