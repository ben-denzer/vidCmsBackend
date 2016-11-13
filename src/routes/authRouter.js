const express           = require('express');
const bodyParser        = require('body-parser');
const jsonParser        = bodyParser.json();
const signupLogic       = require('../config/signupLogic');
const authRouter        = express.Router();
const passport          = require('passport');
const jwt               = require('jsonwebtoken');
const jwtInfo           = require('../../.jwtinfo').key;
const sendPasswordReset     = require('../services/sendPasswordReset');
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

    authRouter.post('/loginWithToken', jsonParser, (req, res) => {
        jwt.verify(req.body.token, jwtInfo, (err, user) => {
            if (err) return res.status(500).send({error: 'session expired, please log in again'});
            connection.query('SELECT u.coins, u.username FROM users u WHERE u.user_id=?',
                [user.user_id],
                (err, rows) => {
                    if (err) return res.status(500).send();
                    res.status(200).send(JSON.stringify({
                        username: rows[0].username,
                        coins: rows[0].coins,
                        token: req.body.token
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
        jwt.verify(req.params.token, jwtInfo, (err, user) => {
            if (err || !user) return res.status(403).send({error: 'unauthorized'});
            resetPw(req, connection, (err, data) => {
                if (err) return res.status(500).send(err);
                res.status(200).send(data);
            });
        });
    });

    return authRouter;
};

module.exports = router;