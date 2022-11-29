const mongoose = require('mongoose');
const post_filter_no_Schema = mongoose.Schema({
  basic_fields: String,
  custom_fields: String,
  post_link: String,
  group_page_id: String,
  posttype: String,
  title: String,
  create_at: Date,
  status: String,
  filter: Boolean,
});

const Post_filter_no = mongoose.model('Post_filter_no', post_filter_no_Schema);
module.exports = Post_filter_no;
