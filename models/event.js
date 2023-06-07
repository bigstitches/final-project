const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  name: { type: String, required: true  },
  creatorId: { type: mongoose.Types.ObjectId, required: true, index: true }
});


module.exports = mongoose.model("items", itemSchema);