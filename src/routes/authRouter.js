const express           = require('express');
const authRouter        = express.Router();
const bcrypt            = require('bcrypt');
const bodyParser        = require('body-parser');
const jsonParser        = bodyParser.json();
const jwt               = require('jsonwebtoken');
const jwtInfo           = require('../../.jwtinfo').key;
const passport          = require('passport');

const signupLogic       = require('../config/signupLogic');
const sendPasswordReset = require('../services/sendPasswordReset');
const resetPw           = require('../services/resetPw');

const router = (connection) => {

    authRouter.post('/changePw', jsonParser, passport.authenticate('local'), (req, res) => {
        const {token, username, password, newPw} = req.body;

        if (newPw.length > 7) return res.status(403).send({error: 'password too short'});

        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user) return res.status(401).send({error: 'unauthorized'});

            bcrypt.hash(newPw, 10, (err, hash) => {
                if (err) return res.status(500).send({error: 'server error'});

                connection.query(
                    'UPDATE users SET password=? WHERE username=?',
                    [hash, username],
                    (err, rows) => {
                        if (err) return res.status(500).send({error: 'server error'});
                        return res.status(200).send({success: 'Changed Password'});
                    }
                );
            });
        });
    });

    authRouter.post('/signup', jsonParser, (req, res) => {
        signupLogic(req, connection, (err, token, userData) => {
            if (err) return res.status(500).send('server error');
            if (token.error) return res.status(403).send({error: token.error});
            res.status(200).send(JSON.stringify({token, userData}));
        });
    });

    authRouter.post('/login', jsonParser, passport.authenticate('local'), (req, res) => {
        const {token, userData} = req.user;
        res.status(200).send(JSON.stringify({token, userData}));
    });

    authRouter.post('/getPremiumVideo', jsonParser, (req, res) => {
        const {video_id, token} = req.body;
        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user || !user.premium) return res.status(403).send({error: 'unauthorized'});
            connection.query(
                'SELECT v.video_title, v.video_headline, v.video_url, v.video_text FROM videos v WHERE v.video_id = ?',
                [video_id],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'server error'});
                    res.status(200).send(JSON.stringify(rows));
                }
            );
        });
    });

    authRouter.post('/loginWithToken', jsonParser, (req, res) => {
        jwt.verify(req.body.token, jwtInfo, (err, user) => {
            if (err) return res.status(401).send({error: 'session expired, please log in again'});

            connection.query(
                'SELECT u.user_id, u.username, u.email, u.premium, u.premium_signup_date, '
                + 'u.signup_date, u.admin, u.banned_user FROM users u WHERE u.user_id=?',
                [user.id],
                (err, rows) => {
                    if (err) return res.status(500).send({error: 'server error'});
                    if (!rows || !rows.length) return res.status(403).send({error: 'unauthorized'});
                    if (rows[0].banned_user) return res.status(401).send({error: 'unauthorized'});

                    const userData = {
                        admin                   : rows[0].admin,
                        email                   : rows[0].email,
                        premium                 : rows[0].premium,
                        premiumExpirationDate   : null,
                        premiumSignupDate       : rows[0].premium_signup_date,
                        signupDate              : rows[0].signup_date,
                        username                : rows[0].username,
                        user_id                 : user.id
                    };

                    res.status(200).send(JSON.stringify({
                        token: jwt.sign(
                            {id: rows[0].user_id},
                            jwtInfo,
                            {expiresIn: '2d'}
                        ),
                        userData
                    }));
                }
            );
        });
    });

    authRouter.post('/resetPassword', jsonParser, (req, res) => {
        connection.query(
            'SELECT u.banned_user FROM users u WHERE email=?',
            [req.body.email],
            (err, rows) => {
                if (err) return res.status(500).send({error: 'server error'});
                if (rows[0].banned_user) return res.status(403).send({error: 'banned user'});

                sendPasswordReset(req.body.email, connection, (err, data) => {
                    if (err) return res.status(500).send({error: 'db error'});
                    res.status(200).send({success: 'email sent', data});
                });
            }
        );
    });

    authRouter.post('/reset/:token', jsonParser, (req, res) => {
        const token = req.params.token;
        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user) return res.status(403).send({error: 'unauthorized'});
            resetPw(req, connection, (err, data) => {
                if (err) return res.status(500).send({error: 'server error'});
                res.status(200).send(data);
            });
        });
    });

    authRouter.post('/submitComment', jsonParser, (req, res) => {
        const token = req.body.token;
        jwt.verify(token, jwtInfo, (err, user) => {
            if (err || !user) return res.status(403).send({error: 'unauthorized'});
            connection.query(
                'INSERT INTO comments(comment_text, user_fk, video_fk, blog_fk, comment_date) VALUES(?,?,?,?,curdate())',
                [req.body.comment, user.id, req.body.video, req.body.blog],
                (err, success) => {
                    if (err) return res.status(500).send(JSON.stringify({error: 'server error'}));

                    res.status(200).send(JSON.stringify({success: 'comment added'}));
                }
            );
        });
    });

    return authRouter;
};

module.exports = router;
