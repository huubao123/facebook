const mongoose = require('mongoose');
const trashtypeSchema = mongoose.Schema({
  ids: [String],
});

const Trash = mongoose.model('Trash', trashtypeSchema);
module.exports = Trash;
