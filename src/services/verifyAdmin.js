const jwt     = require('jsonwebtoken');
const jwtInfo = require('../../.jwtinfo').key;

const verifyAdmin = (connection, token, cb) => {
    jwt.verify(token, jwtInfo, (err, user) => {
        if (err) return cb({error: 'jwt error'});
        if (!user) return cb({error: 'unauthorized'});
        connection.query(
            'SELECT admin FROM users WHERE user_id=?',
            [user.id],
            (err, rows) => {
                if (err) return cb({error: 'db error'});
                if (!rows || !rows.length || !rows[0].admin) return cb({error: 'unauthorized'});
                cb(null, user);
            }
        );
    });
};

module.exports = verifyAdmin;
