const mongoose = require('mongoose');
const post_detal_Schema = mongoose.Schema({
  group_id: String,
  title: String,
  short_description: String,
  long_description: String,
  slug: String,
  session_tags: { tags: Array },
  categories: String,
  key: String,
  name: String,
  featured_image: Array,
  type: String,
  attributes: Array,
  is_active: Number,
  status: String,
  seo_tags: {
    meta_title: String,
    meta_description: String,
  },
  video: Array,
  date: String,
  post_id: String,
  post_link: String,
  user_id: String,
  user_name: String,
  count_like: String,
  count_comment: String,
  count_share: String,
  featured_image: Array,
  comment: [
    {
      content: String,
      count_like: String,
      user_id: String,
      user_name: String,
      imgComment: String,
      children: [
        {
          content: String,
          count_like: String,
          user_id: String,
          user_name: String,
          imageComment: String,
        },
      ],
    },
  ],
});

const Post_detail = mongoose.model('Post_detail', post_detal_Schema);
module.exports = Post_detail;
