let passport        = require('passport');
let localStrategy   = require('./strategies/localStrategy');

module.exports = (app, connection) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    localStrategy(connection);
};