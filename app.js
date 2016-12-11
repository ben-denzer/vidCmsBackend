const express           = require('express');
const app               = express();
const port              = process.env.PORT || 3005;
const dbinfo            = require('./.dbinfo');
const mysql             = require('mysql');
const connection        = mysql.createConnection(dbinfo);
const passportConfig    = require('./src/config/passportConfig');
const path              = require('path');
passportConfig(app, connection);
// const morgan            = require('morgan');

// app.use(morgan('dev'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const authRouter = require('./src/routes/authRouter')(connection);
const adminRouter = require('./src/routes/adminRouter')(connection);
const publicRouter = require('./src/routes/publicRouter')(connection);
app.use('/equinimity/auth', authRouter);
app.use('/equinimity/admin', adminRouter);
app.use('/equinimity/public', publicRouter);
app.get('/equinimity/uploads/:id', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, `/uploads/${req.params.id}`));
});

app.listen(port, (err) => {
    if (err) return console.error(err);
    console.log('listening on ', port);
});