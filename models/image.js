const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
  link_img: Array,
  link_post: String,
  idPost: String,
  update_at: Date,
});

const Images = mongoose.model('Image', imageSchema);
module.exports = Images;
