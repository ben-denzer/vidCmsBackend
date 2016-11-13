const express           = require('express');
const app               = express();
const port              = process.env.PORT || 8001;
const dbinfo            = require('./.dbinfo');
const mysql             = require('mysql');
const connection        = mysql.createConnection(dbinfo);
const passportConfig    = require('./src/config/passportConfig');
passportConfig(app, connection);
const morgan            = require('morgan');

app.use(morgan('dev'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const authRouter = require('./src/routes/authRouter')(connection);
app.use('/flashcards/auth', authRouter);

app.listen(port, (err) => {
    if (err) return console.error(err);
    console.log('listening on ', port);
});