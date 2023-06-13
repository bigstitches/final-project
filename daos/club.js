const mongoose = require('mongoose');

const Club = require('../models/club');

module.exports = {};

module.exports.create = async (club) => {
    const clubCreated = await Club.create( club );
    return clubCreated;
}

module.exports.getAll = async () => {
    const clubs = await Club.find().lean();
    return clubs;
}

module.exports.getById = async (clubId) => {
    const clubFound = await Club.findOne({ _id: clubId }).lean();
    return clubFound;
}

// HW REQUIREMENT: At least one aggregate 
// WILL NOT USE LICENESECLASSNAME YET
// module.exports.mostMembers = async (page, perPage, licenseClassName) => {
module.exports.mostMembers = async (page, perPage, citySearch) => {
    // clubIdScope is array of ids
    console.log('in daos most members');
    console.log('query ', citySearch)
    return Club.aggregate([
    { 
        $match: { "address.city" : citySearch }
    },
    { 
        $group: { 
          _id: "address.city",
          members: { $push: '$members' },
          names: { $push: '$name' }
        } 
    },
    {
        $project: {
            _id: 0,
            names: '$names',
            totalMembers: { $sum : { $size: "$members" } } 
        }
    }
    ]).limit(perPage).skip(perPage*page);
}

// HW REQUIREMENT: At least one text search
module.exports.search = async (page, perPage, query) => {
// module.exports.searchCity = async (query) => {
    if (query) {
      const clubsAtCity = await Club.find({ $text: { $search: query } }).limit(perPage).skip(perPage*page).lean();
      // const clubsAtCity = await Club.find({ $text: { $search: query } }).lean();
      return clubsAtCity;
    } else {
      // return all if no query
      return Club.find().limit(perPage).skip(perPage*page).lean();
      // return Club.find().lean();
    }
  }