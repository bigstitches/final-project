const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true, index: true },
  state: { type: String, required: true },
  zip:  { type: Number, required: true },
}, { strict: false })

// can i add index schema for address? is 'text' also tru for zip code?
// addressSchema.index({ city: 'text', state: 'text' });

const clubSchema = new mongoose.Schema({
  // userId is required, must have user associated to update club members and 
  userId: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', index: true, required: true },
  name: { type: String, required: true, index: true },
  address: { type: addressSchema, index: true },
  members: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', index: true, required: false },
});

clubSchema.index({ name: 'text', "address.city": 'text' });

module.exports = mongoose.model("club", clubSchema);