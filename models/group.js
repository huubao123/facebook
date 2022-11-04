const mongoose = require('mongoose');
const groupSchema = mongoose.Schema({
  name: String,
  url: String,
  posttype: Array,
  create_at: Date,
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
