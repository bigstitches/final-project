// Need a clubId (index: router.use("/club/:clubId/members", require('./members')))
//    -  const clubId = req.params.clubId;
// Regular user can see all members
// Club owner user can see all REQUESTS
// Club owner can change status of member requests to APPROVED
//    - approved requests will ADD the user to the club model members array
// Club owner can change status of member requests to DENIED
// Regular user can CREATE a membership request (initial status is set to PENDING)

const { Router } = require("express");
// const mongoose = require("mongoose");
const profileDAO = require('../daos/profile');
const clubDAO = require('../daos/club');
const membershipDAO = require('../daos/membership');
const isLoggedIn = require('../middleware/isLoggedInProfile');
const router = Router();

//  Update Club Info? not sure i want to use this
router.post("/:id", isLoggedIn, async (req, res, next) => {
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
  } else {
    const { address } = req.body;
    // console.log('whole body: ', req.body, ' address: ', address);
    
    if (!address) {
      res.status(401).send('Only able to update address field');
    } else {
      try {
        const profileChanges = await profileDAO.findByIdUpdate(req.params.id, address);
        res.status(200).json(profileChanges); 
      } catch(e) {
        console.log("ERROR: ", e);
        next(e);
      }
    }
  } 
}); // end POST /:id

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
    /*
    FIXED, ugh, update the index routes 
    In error club validation failed: name: Path `name` is required., userId: Path `userId` 
    is required.
    */
    /*
      item order created {
      userId: '6463d4a2b24d345ef8ed1019',
      items: [ new ObjectId("6463d4a2b24d345ef8ed1011") ],
      total: 1
      }
    */
  } catch(e) {
    console.log('In error', e.message);
    /*
    FIXED, adjusted orders model put brackets around everything after items instead of just the object
      console.log
      In error orders_new validation failed: items.0: Cast to [ObjectId] failed for value "[\n' +
      "  { item: '6463d129d5c67a1ee45d463d' },\n" +
      "  { item: '6463d129d5c67a1ee45d463e' }\n" +
      ']" (type string) at path "items.0" because of "CastError"
    */
    res.status(400).send(e);
  }
});

//  Get specific profile for all users, even when not logged in
router.get("/:id", async (req, res, next) => {
  try {
    // console.log(requestedProfile); // items is empty?!
    const requestedProfile = await profileDAO.findById(req.params.id);
    res.status(200).json(requestedProfile); 
  } catch (error) {
    // console.log(error);
    res.status(500).json(error); 
  }  
}); // end GET /:id

//  Get all profiles: `GET /profile` for all, even when not logged in
router.get("/", async (req, res, _next) => {
  try {
    const profiles = await profileDAO.getProfiles();
    res.status(200).json(profiles); 
  } catch (error) {
    res.status(500).json(error); 
  }
});
module.exports = router;
