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

module.exports.getByCity = async (city) => {
    const clubFound = await Club.find({ address : { city : city } }).lean();
    return clubFound;
}
