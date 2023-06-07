const mongoose = require('mongoose');
/*
const quantitySchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'items', required: true },
  quantity: { type: Number, required: true}
}, { strict: false })

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  items:  { type: [quantitySchema] , required: true },
  total:  { type: Number, required: true }
});
*/

const profileSchema = new mongoose.Schema({
  // userId is not required; member may not have an email associated
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  //callSign: { type: String, required: true, unique: true },
  callSign: { type: String, required: true },
  licenseClass: { type:String, required: true }
});


module.exports = mongoose.model("profile", profileSchema);