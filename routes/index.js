var express = require('express');
var router = express.Router();
// var passport = require('passport');
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var group = require('../controllers/api/group');
var page1 = require('../controllers/api/page1');
var page = require('../controllers/api/page');
const Post = require('.././models/post');
const Group = require('.././models/group');
var group1 = require('../controllers/api/group1');
const video = require('../controllers/sitemap');
const fs = require('fs');
const Queue = require('bull');
const crypto = require('crypto');

const queue = new Queue('group', { redis: { port: 6379, host: '127.0.0.1' } });
const pagequeue = new Queue('page', { redis: { port: 6379, host: '127.0.0.1' } });
const page1queue = new Queue('page1', { redis: { port: 6379, host: '127.0.0.1' } });

const queue1 = new Queue('group1', { redis: { port: 6379, host: '127.0.0.1' } });
const test = new Queue('test', { redis: { port: 6379, host: '127.0.0.1' } });

// const initializeApp = require('firebase/app');

// const getDatabase = require('firebase/database').getDatabase;
// const ref = require('firebase/database').ref;
// const child = require('firebase/database').child;
// const get = require('firebase/database').get;

// const firebaseConfig = {
//   apiKey: 'AIzaSyA8SytL-Kim6L_CSNvYUmVTH2nf6d-cE6c',
//   authDomain: 'facebookpup-4fde6.firebaseapp.com',
//   databaseURL: 'https://facebookpup-4fde6-default-rtdb.asia-southeast1.firebasedatabase.app',
//   projectId: 'facebookpup-4fde6',
//   storageBucket: 'facebookpup-4fde6.appspot.com',
//   messagingSenderId: '207611940130',
//   appId: '1:207611940130:web:3cebdcc6c0a6f19e58297b',
//   measurementId: 'G-3LDE9KDMV2',
// };

router.get('/', async function (req, res, next) {
  res.json({ aaa: 'aaaa' });
});
router.get('/groups', async function (req, res, next) {
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);
  let skip = (page - 1) * limit;
  let group = await Group.find()
    .sort([['create_at', -1]])
    .skip(skip)
    .limit(limit);
  res.json(group);
});
router.get('/groups/:id', async function (req, res, next) {
  await Group.findById(req.params.id, async function (err, post) {
    if (err) {
      res.status(500).send(err);
    } else {
      if (post !== null) {
        res.json(post);
      } else {
        res.send('Not Found');
      }
    }
  });
});
router.post('/post2', async (req, res, next) => {
  var arr = ['success', 'error'];
  res.json({ data: arr[Math.floor(Math.random() * arr.length)], status: 'adsdasds' });
});

router.post('/group1', async (req, res) => {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;
  await queue1.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });
});
queue1.process(async (job, done) => {
  // await new Promise((r) => setTimeout(r, 4000));
  // console.log(job.data);
  await group1(job);
  done();
});
router.post('/add', video);
router.post('/group', async function (req, res, next) {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;

  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });

  await queue.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
});
queue.process(async (job, done) => {
  await group(job);
  done();
});
router.post('/test', async function (req, res, next) {
  try {
    let post = new Post({
      title: 'data.title',
      short_description: 'data.short_description',
      long_description: 'data.long_description',
      slug: 'genSlug(data.title)',
      session_tags: ' { tags: data.tags }',
      categories: 'data.categories' || null,
      key: 'genSlug(data.title)',
      name: 'data.title',
      featured_image: 'imageList && imageList?.length !== 0 ? imageList[0].id : null',
      type: 'data.type',
      attributes: [],
      status: 'publish',
      seo_tags: {
        meta_title: 'New Post Facebook',
        meta_description: 'New Post Facebook',
      },
      video: 'arrVid' || null,
      date: 'data.date',
      post_id: 'data.post.id',
      post_link: 'data.post.link',
      user_id: 'data.user.id',
      user_name: 'data.user.name',
      count_like: 'data.like',
      count_comment: 'data.comment',
      count_share: 'data.share',
      featured_image: 'imageList ? imageList.map((image) => ({ img: image.path })) : null',
      comment: [
        {
          content: 'item.contentComment',
          count_like: 'item.countLike',
          user_id: 'item.userIDComment',
          user_name: 'item.usernameComment',
          imgComment: 'item.imageComment',

          children: [
            {
              content: 'child.contentComment',
              count_like: 'child.countLike',
              user_id: 'child.userIDComment',
              user_name: 'child.usernameComment',
              imageComment: 'child.imageComment',
            },
          ],
        },
        {
          content: 'item.contentComment',
          count_like: 'item.countLike',
          user_id: 'item.userIDComment',
          user_name: 'item.usernameComment',
          imgComment: 'item.imageComment',
        },
      ],
    });
    await post.save();
    res.json(post);
  } catch (e) {
    console.log(e);
  }
});
test.process(async (job, done) => {
  job.progress(100);
  done();
});

router.post('/page', async function (req, res, next) {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;

  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });

  await pagequeue.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
});
pagequeue.process(async (job, done) => {
  await page(job);
  job.progress(100);
  done();
});
router.post('/page1', async function (req, res, next) {
  const jobId = crypto.randomBytes(10).toString('hex');
  const currentTime = new Date().getTime();
  const processAt = new Date(req.body.datetime).getTime();
  const delay = processAt - currentTime;

  res.json({ data: 'success', statusbar: 'ok', jobId: jobId });

  await page1queue.add({ data: req.body, jobId: jobId }, { delay: delay, jobId: jobId });
});
page1queue.process(async (job, done) => {
  await page1(job);
  job.progress(100);
  done();
});

module.exports = router;
