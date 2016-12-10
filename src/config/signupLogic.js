const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../.jwtinfo').key;

const signup = (req, connection, cb) => {
    const {username, password, premium} = req.body;
    const email = req.body.email || null;
    const premiumDate = premium ? 'curdate()' : null;

    const success = () => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return cb({error: 'hashing error'});

            connection.query(
                'INSERT INTO users(username, password, email, premium, signup_date, premium_signup_date) VALUES(?,?,?,?,curdate(),?)',
                [username, hash, email, premium, premiumDate],
                (err, rows) => {
                    if (err) return cb({error: 'db error'});

                    let newUser = {
                        username,
                        user_id: rows.insertId,
                        premium
                    };

                    req.login(newUser, (err) => {
                        if (err) return cb({error: 'passport error'});
                        cb(null, jwt.sign(newUser, jwtSecret, {}));
                    });
                }
            );
        });
    };

    connection.query('SELECT u.user_id FROM users u WHERE username=?',
        [username],
        (err, rows) => {
            if (err) return cb({error: 'db error'});
            if (rows.length) return cb(null, {error: 'username is taken'});
            success();
        }
    );
};

module.exports = signup;