const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({
  link_img: [
    {
      link: String,
      statusbar: String,
    },
  ],
  link_post: String,
  idPost: String,
  update_at: Date,
});

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
