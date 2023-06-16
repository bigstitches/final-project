const mongoose = require('mongoose');
// status: PENDING, ACTIVE, RESCINDED
const membershipSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'profile', index: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'club', index: true },
  status: { type: String, required: true  },
});


module.exports = mongoose.model("memberships", membershipSchema);