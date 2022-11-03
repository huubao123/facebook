var express = require('express');
var router = express.Router();
const Post = require('../models/post');
router.get('/', async function (req, res) {
  let page = parseInt(req.params.page);
  let limit = parseInt(req.params.limit);
  let skip = (page - 1) * limit;
  let post = await Post.find()
    .sort([['create_at', -1]])
    .skip(skip)
    .limit(limit);
  res.json(post);
});
router.get('/:id', async function (req, res) {
  Post.findOne({ _id: req.params.id }, async function (err, post) {
    if (err) {
      res.status(500).send('Something broke!');
    } else {
      res.json(post);
    }
  });
});
router.delete('/:id', async function (req, res) {
  Post.findByIdAndRemove({ _id: req.params.id }, async function (err, post) {
    if (err) {
      res.status(500).send('Something broke!');
    } else {
      res.json({ data: 'success' });
    }
  });
});
module.exports = router;
