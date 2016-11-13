const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../../.jwtinfo').key;

const signup = (req, connection, cb) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email || null;

    const success = () => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return cb({error: 'hashing error'});

            connection.query(
                'INSERT INTO users(username, password, email) VALUES(?,?,?)',
                [username, hash, email],
                (err, rows) => {
                    if (err) return cb({error: 'db error'});

                    let newUser = {
                        username,
                        user_id: rows.insertId,
                    };

                    req.login(newUser, (err) => {
                        if (err) return cb({error: 'passport error'});
                        cb(null, jwt.sign(Object.assign({}, newUser, {coins: 0}), jwtSecret, {}));
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