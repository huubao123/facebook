const mongoose = require('mongoose');
const groupSchema = mongoose.Schema({
  name: String,
  type: String,
  dependencies: {},
  required: [],
  api: String,
});
const Antd = mongoose.model('Antd', groupSchema);
module.exports = Antd;
