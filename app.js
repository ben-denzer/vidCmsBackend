const express           = require('express');
const app               = express();
const port              = process.env.PORT || 3005;
const dbinfo            = require('./.dbinfo');
const mysql             = require('mysql');
const connection        = mysql.createConnection(dbinfo);
const passportConfig    = require('./src/config/passportConfig');
const path              = require('path');
passportConfig(app, connection);

process.env.ENV === 'dev' && app.use(require('morgan')('dev'));

const domain = process.env.ENV === 'dev' ? 'http://localhost:3000' : 'http://localhost';

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const apiPath = process.env.ENV && process.env.ENV === 'dev' ? '' : '/cmsReact';

const authRouter    = require('./src/routes/authRouter')(connection);
const adminRouter   = require('./src/routes/adminRouter')(connection);
const publicRouter  = require('./src/routes/publicRouter')(connection);
app.use(`${apiPath}/auth`, authRouter);
app.use(`${apiPath}/admin`, adminRouter);
app.use(`${apiPath}/public`, publicRouter);
app.get(`${apiPath}/uploads/:id`, (req, res) => {
    res.status(200).sendFile(path.join(__dirname, `/uploads/${req.params.id}`));
});

app.listen(port, (err) => {
    if (process.env.ENV === 'dev') {
        if (err) return console.error(err);
        console.log('listening on ', port);
    }
});
