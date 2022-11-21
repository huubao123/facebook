const mongoose = require('mongoose');
const trashSchema = mongoose.Schema({
  ids: Array,
});

const Trash = mongoose.model('Trash', trashSchema);
module.exports = Trash;
