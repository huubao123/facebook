const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
  basic_fields: String,
  custom_fields: String,
  group_id: String,
  posttype: String,
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
