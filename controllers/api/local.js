var passport = require('passport');
// var User = require('../../models/Users');
var passportLocal = require('passport-local');
// const randToken = require('rand-token');
const bcrypt = require('bcrypt');
let LocalStrategy = passportLocal.Strategy;
let initPassportLocal = () => {
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          var user = await User.findOne({ email: email }).lean();
          if (!user) {
            return done(null, false);
          }
          if (user.email == 'admin@tdtu.edu.vn') {
            if (user.password == password) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          }
          const checkPassword = await bcrypt.compare(password, user.password);
          // let checkPassword = await(user.findOne({'password':password}));

          if (!checkPassword) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          console.log(error);
          return done(null, false);
        }
      }
    )
  );
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

module.exports = initPassportLocal;
