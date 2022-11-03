const mongoose = require('mongoose');
const groupSchema = mongoose.Schema({
  name: String,
  url: String,
  create_at: Date,
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
