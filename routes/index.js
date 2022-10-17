var express = require('express');
var router = express.Router();
// var passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var facebook = require('../controllers/api/facebook');
var facebook1 = require('../controllers/api/facebook1.js');
const video = require('../controllers/sitemap');
const fs = require('fs');
const Queue = require('bull');
const crypto = require('crypto');

const queue = new Queue('facebook', { redis: { port: 6379, host: '127.0.0.1' } });
const queue1 = new Queue('facebook1', { redis: { port: 6379, host: '127.0.0.1' } });

// main().catch(console.error);
// var q = kue.createQueue({
//   prefix: 'q',
//   redis: {
//     port: 6379,
//     host: '127.0.0.1',
//     db: 3, // if provided select a non-default redis db
//     options: {
//       // see https://github.com/mranney/node_redis#rediscreateclient
//     },
//   },
// });
// const queue = kue.createQueue();
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
// router.post('/post', facebook);
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

router.post('/post1', async (req, res) => {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;
  await queue1.add({ data: req.body }, { delay: delay, jobId: jobId });
  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });
});
router.post('/add', video);
router.post('/post', async function (req, res, next) {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;
  await facebook(req.body);
  //await queue.add({ data: req.body }, { delay: delay, jobId: jobId });
  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });
});
queue.process(async (job, done) => {
  await new Promise((r) => setTimeout(r, 4000));
  console.log(job.data);
  // if (job.data.url.indexOf('posts') > -1) {
  //   await facebook1(job);
  // }

  done();
});
queue1.process(async (job, done) => {
  await new Promise((r) => setTimeout(r, 4000));
  console.log(job.data);
  //await facebook1(job);
  done();
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
