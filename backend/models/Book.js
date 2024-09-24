const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: [String],
  description: String,
  coverImage: String,
  fileUrl: { type: String, required: true },
  ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number }],
  reviews: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String }],
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);