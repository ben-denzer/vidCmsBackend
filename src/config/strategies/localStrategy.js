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
                    'SELECT u.user_id, u.password, u.coins FROM users u WHERE u.username = ?',
                    [username],
                    (err, rows) => {
                        if (err) cb({error: 'db error'});
                        if (!rows || !rows.length) return cb(null, false);

                        const user = {
                            user_id: rows[0].user_id,
                            username: rows[0].username,
                            coins: rows[0].coins
                        };

                        bcrypt.compare(password, rows[0].password, (err, res) => {
                            if (err) return cb({error: 'bcrypt error'});
                            if (res) {
                                cb(null, {token: jwt.sign(user, jwtSecret, {}), coins: user.coins});
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