const User = require('../models/user');

module.exports = {};

module.exports.getUser = async (inputEmail) => {
  // console.log(`User DAOS: ${email}`);
  try {
    const foundUser = await User.findOne({ email: inputEmail }).lean();
    return foundUser;
  } catch (error) {
    // console.log('Get user error, ', error);
    return null;
  }
  
}

module.exports.getRoles = async (userId) => {
  try {
    const foundUser = await User.findOne({ _id: userId }).lean();
    // console.log(foundUser.email, ' ', foundUser.roles);
    return foundUser.roles;
  } catch (error) {
    // console.log('Get user error, ', error);
    return [];
  }
  
}

module.exports.getById = async (userId) => {
  try {
    const foundUser = await User.findOne({ _id: userId }).lean();
    // console.log(foundUser.email, ' ', foundUser.roles);
    return foundUser;
  } catch (error) {
    // console.log('Get user error, ', error);
    return;
  }
  
}

module.exports.updateUserPassword = async (userId, hashword) => {
  // const updatedPassword = await User.updateOne({ _id : userId , password });
  // why? need to investigate more the difference
  const updatedPassword = await User.findByIdAndUpdate( userId, { password: hashword });
  return updatedPassword;
}

module.exports.createUser = async (userObj) => {
  try {
    // console.log('Created: ', userObj, userObj.email, ', ', userObj.password);
    const created = await User.create(userObj);
    return created;
  } catch (e) {
    // console.log('hrerere: ', e)
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;