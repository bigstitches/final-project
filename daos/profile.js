const Profile = require('../models/profile');
const Membership = require('../models/membership');

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

// find by ID,return the user ID
module.exports.findById = async (profId) => {
  const profile = await Profile.findOne({ _id:profId }).lean();
  // console.log('IN DAOSDDDDD ', profile);
  return profile;
}

// find the membership requests of the logged in user
module.exports.requestsNameCallSignbyProfile = async (profId) => {
  //console.log( 'IN DAAASOOO: ', profId)
  //const profile = await Profile.findOne({ userId:profId }).lean();
  //console.log("INN PROFILE DAOO"); { $match: { _id : profId } },         _id: 0,
  const profileEmailInfo = Profile.aggregate([
    { $match: { _id : profId } }, 
    {
      $lookup: {
        from: 'memberships', // which schema to find
        localField: '_id', // field in the profile collection
        foreignField: 'profileId', // field in the membership colleciton
        as: 'memberships'
      }
    },
    {
      $group: {
        _id: '$_id', // from profile
        memberships: { $push: '$memberships'},
        callSign: { $push: '$callSign'},
        name: { $push: '$name'}
      }
    },
    {
      $unwind: '$memberships'
    },
    {
      $unwind: '$memberships'
    },
    {
      $project: {
        name: '$name',
        callSign: '$callSign',
        memberships: '$memberships',
      }
    }
  ])
  return profileEmailInfo;
} 

// find by order ID,return the user ID
module.exports.findByProfileId = async (profId) => {
  const profile = await Profile.findOne({ userId:profId }).lean();
  // console.log('IN DAOSDDDDD ', profile);
  return profile;
} // findByProfileId

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
