const nodemailer      = require('nodemailer');
const mg              = require('nodemailer-mailgun-transport');
const mailgunAuth   = require('../../.mailgun_conf.js');
const jwt           = require('jsonwebtoken');
const jwtInfo       = require('../../.jwtinfo').key;

const auth = {
    auth: {
        api_key: mailgunAuth.api_key,
        domain: mailgunAuth.domain
    }
};

const apiUrl = 'https://bdenzer.xyz/';

const sendMail = (email, connection, cb) => {
    connection.query(
        'SELECT u.username FROM users u WHERE u.email=?',
        [email],
        (err, rows) => {
            const userOnAccount = rows[0].username

            const token = jwt.sign({email}, jwtInfo, {expiresIn: '2h'}, (err, token) => {
                const nodemailerMailgun = nodemailer.createTransport(mg(auth));

                nodemailerMailgun.sendMail({
                    from: 'ben@bdenzer.com',
                    to: email, // An array if you have multiple recipients.
                    subject: 'Password Reset',
                    'h:Reply-To': 'denzer.ben@gmail.com',
                    html: `The user ssociated with your email address is <b>${userOnAccount}</b>. Here is your password reset link: <a href="${apiUrl}auth/reset/${token}">${apiUrl}auth/reset/${token}</a>`,
                    }, (err, info) => {
                        if (err) cb(err);
                        cb(null, info);
                    }
                );
            });
        }
    );
};

module.exports = sendMail;
