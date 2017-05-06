const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../.jwtinfo').key;

const signup = (req, connection, cb) => {
    const {email, password, premium, username} = req.body;
    if (!email || !password || !username) return cb(null, {error: 'invalid'});
    if (password.length < 7) return cb(null, {error: 'password too short'});
    const premiumSignupDate = premium ? 'curdate()' : null;

    const success = () => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return cb({error: 'hashing error'});

            connection.query(
                'INSERT INTO users(username, password, email, premium, signup_date, '
                + 'premium_signup_date) VALUES(?,?,?,?,curdate(),?)',
                [username, hash, email, premium, premiumSignupDate],
                (err, rows) => {
                    if (err) return cb({error: 'db error'});

                    const userData = {
                        admin: false,
                        email,
                        premium,
                        premiumExpirationDate: null,
                        premiumSignupDate,
                        signupDate: new Date(),
                        username,
                        user_id: rows.insertId
                    };

                    cb(
                        null,
                        jwt.sign(
                            {id: userData.user_id},
                            jwtSecret,
                            {expiresIn: '2d'}
                        ),
                        userData
                    );
                }
            );
        });
    };

    connection.query(
        'SELECT u.email FROM users u WHERE email=?',
        [email],
        (err, rows) => {
            if (err) return cb({error: 'db error'});
            if (rows && rows.length) return cb(null, {error: 'email in use'});

            connection.query('SELECT u.user_id FROM users u WHERE username=?',
                [username],
                (err, rows) => {
                    if (err) return cb({error: 'db error'});
                    if (rows && rows.length) return cb(null, {error: 'username is taken'});

                    success();
                }
            );
        }
    );
};

module.exports = signup;
