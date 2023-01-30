const mongoose = require('mongoose');
const pageSchema = mongoose.Schema({
  name: String,
  url: String,
  info: {
    like: String,
    follow: String,
    mail: String,
    phone: String,
    link: String,
    address: String,
    check_in: String,
    shipping: String,
    rank: String,
    Wi_Fi: String,
    message: String,
    price: String,
    content: String,
    open: String,
    Impressum: String,
  },
  create_at: Date,
  post1: {
    basic_fields: String,
    custom_fields: String,
  },
  post2: {
    basic_fields: String,
    custom_fields: String,
  },
});

const Page = mongoose.model('Page', pageSchema);
module.exports = Page;
