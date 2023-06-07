const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  password:  { type: String, required: true},
  email: { type: String, unique: true, required: true},
  // operator, club or admin
  roles: { type: [String], required: true }
});


module.exports = mongoose.model("users", userSchema);