const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
  basic_fields: String,
  custom_fields: String,
  post_link: String,
  group_id: String,
  posttype: String,
  create_at: Date,
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
