const express = require('express');
const router = express.Router();
const postapi = require('../controllers/api/post');
const Post = require('../models/post');
const Posttype = require('../models/posttype');
router.get('/', postapi.getPost);
router.get('/:id', postapi.getPost_id);
router.delete('/:id', postapi.deletePost_id);
module.exports = router;
