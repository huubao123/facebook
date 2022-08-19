var express = require('express');
var router = express.Router();
// var passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var facebook = require('../controllers/api/facebook.js');
var timeout = require('connect-timeout');
const fs = require('fs');

const initializeApp = require('firebase/app');

const getDatabase = require('firebase/database').getDatabase;
const ref = require('firebase/database').ref;
const onValue = require('firebase/database').onValue;

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

const firebaseConfig = {
  apiKey: 'AIzaSyA8SytL-Kim6L_CSNvYUmVTH2nf6d-cE6c',
  authDomain: 'facebookpup-4fde6.firebaseapp.com',
  databaseURL:
    'https://facebookpup-4fde6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'facebookpup-4fde6',
  storageBucket: 'facebookpup-4fde6.appspot.com',
  messagingSenderId: '207611940130',
  appId: '1:207611940130:web:3cebdcc6c0a6f19e58297b',
  measurementId: 'G-3LDE9KDMV2',
};
const app = initializeApp.initializeApp(firebaseConfig);
const database = getDatabase(app);
const starCountRef = ref(database, '/postList');

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
router.post('/post', facebook);
router.get('/post', async function (req, res, next) {
  onValue(starCountRef, (snapshot) => {
    res.json(snapshot.val());
  });
});

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
