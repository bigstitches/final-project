const Membership = require('../models/membership');
const Club = require('../models/club');

module.exports = {};

// update profile ADMIN - can update all aspects of profile
// Profile.findByIdAndUpdate

// update profile USER - can update address
// Profile.findByIdAndUpdate

// admin and user can access this item (OLD)
// only admin can create a profile (after license aquired)
module.exports.createItem = async (newOrder) => {
  // console.log('here created order DAOS');
  // console.log('DAOS ATTEMPTING TO CREATE: ', newOrder)
  const profile = await Membership.create(newOrder);
  // console.log('DAOS profile, ', profile);
  return profile;
}

// find by order ID,return the user ID
module.exports.findById = async (orderId) => {
  const order = await Membership.findOne({ _id:orderId }).lean();
  return order.userId;
}

// find by ID, update profile
module.exports.findByIdUpdate = async (userId, updates) => {
  const profile = await Membership.findByIdAndUpdate(userId, updates, {new: true}).lean();
  return profile;
}

//
module.exports.findMatchUserAndProfile = async (userObjectId, orderId) => {
  const order = await Membership.findOne({ userId:userObjectId, _id:orderId }).lean();
  return order;
}



module.exports.findByIdAdmin = async (orderId) => {
  const order = await Membership.findOne({ _id:orderId }).lean();
  return order;
}

// ALL (even not logged in) can get all orders
module.exports.getProfiles = () => {
  return Membership.find().lean();
}

/*
* @params [ userObjectId ], input the user ObjectId to get all their orders
*/
module.exports.getOrdersUser = async (userObjectId) => {
  return await Membership.find({userId : userObjectId});
}


//
module.exports.getMembers = async (clubId) => {
  const { members } = await Club.findOne({ _id:clubId }).lean();
  return members;
}

//
module.exports.getStatus = async (profileId, clubId) => {
  const { status } = await Membership.findOne({ profileId:profileId, clubId:clubId }).lean();
  return status;
}