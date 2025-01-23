const mongoose = require('mongoose');

const addclassSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  radius: { type: Number, required: true }, // Radius in meters
});

module.exports = mongoose.model('AddClass', addclassSchema);