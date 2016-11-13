var nodemailer      = require('nodemailer');
var mg              = require('nodemailer-mailgun-transport');
const mailgunAuth   = require('../../.mailgun_conf.js');
const jwt           = require('jsonwebtoken');
const jwtInfo       = require('../../.jwtinfo').key;

const auth = {
    auth: {
        api_key: mailgunAuth.api_key,
        domain: mailgunAuth.domain
    }
}

const sendMail = (email, connection, cb) => {

    connection.query(
        'SELECT u.username FROM users u WHERE u.email=?',
        [email],
        (err, rows) => {
            const usersOnAccount = rows.map(a => a.username).join(', ');

            const token = jwt.sign({email}, jwtInfo, {expiresIn: '10m'}, (err, token) => {
                const nodemailerMailgun = nodemailer.createTransport(mg(auth));

                nodemailerMailgun.sendMail({
                    from: 'ben@bdenzer.com',
                    to: email, // An array if you have multiple recipients.
                    subject: 'Password Reset',
                    'h:Reply-To': 'denzer.ben@gmail.com',
                    html: `The ${rows.length > 1 ? 'users' : 'user'} associated with your email address ${rows.length > 1 ? 'are' : 'is'} <b>${usersOnAccount}</b>. Here is your password reset link: <a href="https://bdenzer.com/projects/flashcards/reset/${token}">https://bdenzer.com/projects/flashcards/reset/${token}</a>`,
                    }, (err, info) => {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null, info);
                        }
                    }
                );
            });
        }
    );
};

module.exports = sendMail;