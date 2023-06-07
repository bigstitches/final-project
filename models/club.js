const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip:  { type: Number, required: true },
}, { strict: false })

const clubSchema = new mongoose.Schema({
  // userId is required, must have user associated to update club members and 
  userId: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', index: true, required: true },
  name: { type: String, required: true },
  address: { type: addressSchema, required: true },
  members: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', index: true, required: false },
});


module.exports = mongoose.model("club", clubSchema);