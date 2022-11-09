const mongoose = require('mongoose');
const post_typeSchema = mongoose.Schema({
  name: String,
  create_at: Date,
  groups: Array,
  pages: Array,
});

const Posttype = mongoose.model('Post_type', post_typeSchema);
module.exports = Posttype;
