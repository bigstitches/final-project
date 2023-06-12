const Profile = require('../models/profile');

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
  const profile = await Profile.create(newOrder);
  // console.log('DAOS profile, ', profile);
  return profile;
}

// find by order ID,return the user ID
module.exports.findById = async (orderId) => {
  const profile = await Profile.findOne({ _id:orderId }).lean();
  return profile;
}

// find by order ID,return the user ID
module.exports.findByUserModelId = async (idOfUser) => {
  const profile = await Profile.findOne({ userId:idOfUser }).lean();
  return profile;
}

// find by ID, update profile
module.exports.findByIdUpdate = async (userId, updates) => {
  const profile = await Profile.findByIdAndUpdate(userId, updates, {new: true}).lean();
  return profile;
}

//
module.exports.findMatchUserAndProfile = async (userObjectId, orderId) => {
  const order = await Profile.findOne({ userId:userObjectId, _id:orderId }).lean();
  return order;
}

module.exports.findByIdAdmin = async (orderId) => {
  const order = await Profile.findOne({ _id:orderId }).lean();
  return order;
}

// ALL (even not logged in) can get all orders
module.exports.getProfiles = () => {
  return Profile.find().lean();
}

/*
* @params [ userObjectId ], input the user ObjectId to get all their orders
*/
module.exports.getOrdersUser = async (userObjectId) => {
  return await Profile.find({userId : userObjectId});
}
