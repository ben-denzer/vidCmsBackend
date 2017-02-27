const passport          = require('passport');
const localStrategy     = require('passport-local').Strategy;
const bcrypt            = require('bcrypt');
const jwt               = require('jsonwebtoken');
const jwtSecret         = require('../../../.jwtinfo').key;

const login = (connection) => {
    passport.use(
        new localStrategy(
            {
                usernameField: 'username',
                passwordField: 'password'
            },
            (username, password, cb) => {
                connection.query(
                    'SELECT u.user_id, u.password, u.premium, u.admin FROM users u WHERE u.username = ?',
                    [username],
                    (err, rows) => {
                        if (err) {
                            console.log(err);
                            cb({error: 'db error'});
                        }
                        if (!rows || !rows.length) return cb(null, false);

                        const user = {
                            user_id:    rows[0].user_id,
                            premium:    rows[0].premium,
                            admin:      rows[0].admin,
                            username:   rows[0].username
                        };

                        bcrypt.compare(password, rows[0].password, (err, res) => {
                            if (err) return cb({error: 'bcrypt error'});
                            if (res) {
                                cb(null, {premium: user.premium, admin: user.admin, token: jwt.sign(user, jwtSecret, {expiresIn: '2d'})});
                            } else {
                                cb(null, false);
                            }
                        });
                    }
                );
            }
        )
    );
};

module.exports = login;