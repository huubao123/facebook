const mongoose = require('mongoose');
const postSchema = mongoose.Schema({
  basic_fields: String,
  custom_fields: String,
  post_link: String,
  group_page_id: String,
  posttype: String,
  title: String,
  create_at: Date,
  status: String,
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
