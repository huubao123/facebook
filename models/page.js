const mongoose = require('mongoose');
const pageSchema = mongoose.Schema({
  name: String,
  url: String,
  info: String,
  create_at: Date,
});

const Page = mongoose.model('Page', pageSchema);
module.exports = Page;
