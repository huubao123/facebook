var express = require('express');
var router = express.Router();
// var passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var facebook = require('../controllers/api/facebook.js');
var timeout = require('connect-timeout');

// require('../controllers/api/local.js')(passport);
// var csrf = require('csurf');
// var csrfProtection = csrf({ cookie: true });
/* GET home page. */
// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) return next();
//   res.redirect('/login');
// }
// function toJSON() {
//   return { message: this.message, status: this.status };
// }

// const generateJwtToken = (user) => {
//   const token = jwt.sign({ user }, credentials.JWT_SECRET, {
//     expiresIn: '1d',
//   });
//   return token;
// };
//
router.get('/', async function (req, res, next) {
  //   console.log(req.headers.cookie);
  // res.header("token",req.headers.cookie.split('; ')[2].slice(4))
  res.json({ aaa: 'aaaa' });
  //   res.render('main', {
  //     layout: 'layout',
  //     title: 'Social',
  //     // username: req.user.name,
  //     // picture: req.user.picture,
  //     // id: req.user._id,
  //     // role: req.user.role,
  //   });
});
// router.get('/login', login.login);
router.post('/post', timeout('120s'), facebook);

// router.post(
//   '/login',
//   passport.authenticate('local', {
//     failureRedirect: '/login',
//   }),
//   (req, res) => {
//     // const token = generateJwtToken(req.user);
//     // res.setHeader("Content-Type", "application/json");
//     // res.setHeader('field', token)
//     res.redirect('/');
//   }
// );

module.exports = router;
