const { Router } = require("express");
// const mongoose = require("mongoose");
const profileDAO = require('../daos/profile');
const clubDAO = require('../daos/club');
const isLoggedIn = require('../middleware/isLoggedInProfile');
const router = Router();

//  Update Club Info? not sure i want to use this
router.put("/:id", isLoggedIn, async (req, res, next) => {
  if ( !req.userId.roles.includes('admin') ) { 
    // console.log('HERE IN not admin');
    res.status(401).send('Unable to Access');
  // else admin
  } else if (req.userId.roles.includes('admin')) {
    const profileUpdates = req.body;
    // console.log('POST ID: REQ.BODY: ', req.body);

    try {
      const profileChanges = await profileDAO.findByIdUpdate(req.params.id, profileUpdates);
      res.status(200).json(profileChanges); 
    } catch(e) {
      console.log("ERROR: ", e);
      next(e);
    }
  // Update only address
  } 
}); // end PUT /:id

// Create `POST /club` - only available to ADMIN
router.post("/", isLoggedIn, async (req, res, next) => {
  // only admin can create a new club
  if ( !req.userId.roles.includes('admin') ) { 
    // console.log('ACCESS ISSUE PROFILE');
    res.status(401).send('Unable to Access');
  // else, you're admin, next()
  } else {
    // console.log(req.userId.roles, " ROLES");
    next();
  }
}, async (req, res, next) => {  
  // Middleware Handle the Inputs
  // const profile = req.body._doc;
  const profile = req.body;
  // if the array is empty
  // console.log("profile?, ", profile);
  if (!profile || profile === {}) {
    console.log('EMPTY CLUB INFO ', req.body);
    res.status(401).send('Empty Clubs Cannot be Created');
  } else {
    next();
  }
}, async (req, res, next) => {
  // Middleware Handle the Inputs
  const club = req.body;
  const address = req.body.address;

  const newAddress = {
    'address': address.address,
    'city':  address.city,
    'state':  address.state,
    'zip': address.zip,
  }
  // userId is the account that can update club membership
  // userId is the account that can create events
  const newClub = {
    'userId': club.userId,
    'name':  club.name,
    'address':  newAddress
  }
  // console.log('HERE CLUB ROUTE: ', newClub);
  try {
    // console.log('item order created', newOrder);
    const clubCreated = await clubDAO.create(newClub); 
    // console.log('HERE CLUB ROUTE: ', clubCreated);
    res.status(200).json(clubCreated); 
  } catch(e) {
    console.log('In error', e.message);
    res.status(400).send(e);
  }
});

// Read - most mbrs by requested city
router.get("/mostMembers", async (req, res, next) => {
  let { page, perPage, query } = req.query;
  console.log('in most members route', query);
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  // console.log(query);
  // const searchResults = await clubDAO.mostMembers(page, perPage, clubIds);
  // in future by city
  const searchResults = await clubDAO.mostMembers(page, perPage, query);
  res.json(searchResults);
});

// Read - search all club
router.get("/search", async (req, res, next) => {
  let { page, perPage, query } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  // console.log(query);
  const searchResults = await clubDAO.search(page, perPage, query);
  res.json(searchResults);
});

//  Get specific profile for all users, even when not logged in
router.get("/:id", async (req, res, next) => {
  try {
    // console.log(requestedProfile); // items is empty?!
    const requestedClub = await clubDAO.getById(req.params.id);
    res.status(200).json(requestedClub); 
  } catch (error) {
    // console.log(error);
    res.status(500).json(error); 
  }  
}); // end GET /:id

//  Get all profiles: `GET /profile` for all, even when not logged in
router.get("/", async (req, res, _next) => {
  try {
    const clubs = await clubDAO.getAll();
    res.status(200).json(clubs); 
  } catch (error) {
    res.status(500).json(error); 
  }
});

module.exports = router;
