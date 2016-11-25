const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtInfo = require('../../.jwtinfo').key;

const resetPw = (req, connection, cb) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        connection.query(
            'UPDATE users SET password=? WHERE username=?',
            [hash, req.body.username],
            (err, success) => {
                if (err) return cb({error: 'db error 1'});
                connection.query('SELECT u.user_id, u.admin, u.premium FROM users u WHERE u.username=?',
                    [req.body.username],
                    (err, rows) => {
                        if (err) return cb({error: 'db error 2'});
                        cb(null, JSON.stringify({
                            username: req.body.username,
                            admin: rows[0].admin,
                            premium: rows[0].premium,
                            token: jwt.sign({
                                id: rows[0].user_id
                            }, jwtInfo)
                        }));
                    }
                );
            }
        );
    });
};

module.exports = resetPw;