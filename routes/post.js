const express = require('express');
const router = express.Router();
const postapi = require('../controllers/api/post');
router.get('/', postapi.getPost);
router.get('/all', postapi.getall);

router.get('/:id', postapi.getPost_id);
router.delete('/:id', postapi.deletePost_id);
module.exports = router;
