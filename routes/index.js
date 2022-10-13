var express = require('express');
var router = express.Router();
// var passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var facebook = require('../controllers/api/facebook');
var facebook1 = require('../controllers/api/facebook1.js');
const video = require('../controllers/sitemap');
var timeout = require('connect-timeout');
const fs = require('fs');
var kue = require('kue'),
  redis = require('redis');
kue.redis.createClient = function () {
  var client = redis.createClient({ url: 'redis://redis:6379' });
  client.on('error', function (err) {
    console.log('trolllolo');
  });
  return client;
};
jobs = kue.createQueue();
const initializeApp = require('firebase/app');

const getDatabase = require('firebase/database').getDatabase;
const ref = require('firebase/database').ref;
const child = require('firebase/database').child;
const get = require('firebase/database').get;
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
  databaseURL: 'https://facebookpup-4fde6-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'facebookpup-4fde6',
  storageBucket: 'facebookpup-4fde6.appspot.com',
  messagingSenderId: '207611940130',
  appId: '1:207611940130:web:3cebdcc6c0a6f19e58297b',
  measurementId: 'G-3LDE9KDMV2',
};
const app = initializeApp.initializeApp(firebaseConfig);
const database = getDatabase(app);

router.get('/', async function (req, res, next) {
  res.json({ aaa: 'aaaa' });
});
// router.get('/login', login.login);
router.post('/post', facebook);
router.post('/post2', async (req, res, next) => {
  var arr = ['success', 'error'];
  res.json({ data: arr[Math.floor(Math.random() * arr.length)], status: 'adsdasds' });
});

router.get('/post_link', async function (req, res, next) {
  fs.readFile('item2.txt', function (err, data) {
    aaa = JSON.parse(data);
    bbb = [];
    for (var i = 0; i < aaa.length; i++) {
      bbb.push(aaa[i].linkPost);
    }
    fs.writeFile('item.txt', JSON.stringify(bbb, null, 2), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    // aaa.forEach((element) => {
    //   fs.writeFile('item.txt', JSON.stringify(element.linkPost, null, 2), (err) => {
    //     if (err) throw err;
    //     console.log('The file has been saved!');
    //   });
    // });
  });
});

router.post('/post1', facebook1);
router.post('/add', video);
router.get('/test', async function (req, res, next) {
  // queue
  //   .on('job enqueue', function (id, type) {
  //     console.log('Job %s got queued of type %s', id, type);
  //     new Promise((r) => setTimeout(r, 4000));
  //     res.json({ data: 'error', statusbar: 'ok' });
  //   })
  //   .on('job complete', function (id, result) {
  //     kue.Job.get(id, function (err, job) {
  //       if (err) return;
  //       job.remove(function (err) {
  //         if (err) throw err;
  //         console.log('removed completed job #%d', job.id);
  //       });
  //     });
  //   });
});

router.get('/post1', async function (req, res, next) {
  const url = req.body.url;
  url_id = url.split('/');
  if (url_id[3] == 'groups') {
    id = url_id[6];
  } else {
    id = url_id[5];
  }
  if (!url) {
    res.json('url is required');
  }
  const dbRef = ref(getDatabase());
  get(child(dbRef, '/postList1/' + id))
    .then((snapshot) => {
      if (snapshot.exists()) {
        res.json(snapshot.val());
      } else {
        res.send('No data available');
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get('/post', async function (req, res, next) {
  const url = req.body.url;
  if (!url) {
    res.json('url is required');
  }
  const dbRef = ref(getDatabase());
  get(child(dbRef, '/postList/' + url.split('/')[4].replace(/[#:.,$]/g, '')))
    .then((snapshot) => {
      if (snapshot.exists()) {
        res.json(snapshot.val());
      } else {
        res.send('No data available');
      }
    })
    .catch((error) => {
      console.error(error);
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
