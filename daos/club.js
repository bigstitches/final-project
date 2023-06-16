const mongoose = require('mongoose');
//const club = require('../models/club');

const Club = require('../models/club');

module.exports = {};

module.exports.create = async (club) => {
    const clubCreated = await Club.create( club );
    return clubCreated;
}

// find by ID, update profile
module.exports.findByIdUpdate = async (userId, updates) => {
    const club = await Club.findByIdAndUpdate(userId, updates, {new: true}).lean();
    return club;
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
// Get Club with Most Members by City
// module.exports.mostMembers = async (page, perPage, licenseClassName) => {
module.exports.mostMembers = async (page, perPage, citySearch) => {
    // clubIdScope is array of ids
    //console.log('in daos most members');
    //console.log('query ', citySearch)
    return Club.aggregate([
    { 
        $match: { "address.city" : citySearch }
    },
    { 
        $group: { 
          // group by each club's name
          _id: "$name",
          //members: "members",
          names: { $push: '$name' },
          members: { $push: '$members'}
          // names: '$name' 
        } 
    },
    {
        $unwind: '$members'
    },
    {
        $project: {
            _id: 0,
            Name: '$_id',
            // totalMembers: { $size: "$members" } 
            // totalMembers: "$members"
            "Total Members": { $size : "$members" } 
            // totalMembers: "$members" 
        }
    },
    { 
        $sort: { 
            "Total Members":-1
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