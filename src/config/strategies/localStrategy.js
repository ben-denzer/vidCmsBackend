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
                    'SELECT u.user_id, u.password, u.email, u.premium, u.premium_signup_date, '
                    + 'u.signup_date, u.admin, u.banned_user FROM users u WHERE u.username = ?',
                    [username],
                    (err, rows) => {
                        setTimeout(() => {
                            if (err)                    return cb({error: 'db error'});
                            if (!rows || !rows.length)  return cb(null, false);
                            if (rows[0].banned_user)    return cb(null, false);

                            const userData = {
                                admin                   : rows[0].admin,
                                email                   : rows[0].email,
                                premium                 : rows[0].premium,
                                premiumExpirationDate   : null,
                                premiumSignupDate       : rows[0].premium_signup_date,
                                signupDate              : rows[0].signup_date,
                                username                : username,
                                user_id                 : rows[0].user_id
                            };
                            bcrypt.compare(password, rows[0].password, (err, res) => {
                                if (err) return cb({error: 'bcrypt error'});
                                if (res) {
                                    cb(
                                        null,
                                        {
                                            userData,
                                            token: jwt.sign(
                                                {id: userData.user_id},
                                                jwtSecret,
                                                {expiresIn: '2d'}
                                            )
                                        }
                                    );
                                } else {
                                    cb(null, false);
                                }
                            });
                        }, 1000);
                    }
                );
            }
        )
    );
};

module.exports = login;
