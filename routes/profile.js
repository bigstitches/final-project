const { Router } = require("express");
// const mongoose = require("mongoose");
const profileDAO = require('../daos/profile');
const isLoggedIn = require('../middleware/isLoggedInProfile');
const router = Router();

//  Update a specific profile; ADMIN can Update All; user can update their own address
//  middleware to check body for any info REQUIRED
router.post("/:id", isLoggedIn, async (req, res, next) => {
  // console.log("REQ.USERID._ID ", req.userId._id);
  // console.log("REQ.Params.id ", req.params.id);
  // console.log("req.userId.roles ", req.userId.roles);
  // find out if the userId._id and the requested profile match
  const profileUserMatch = await profileDAO.findMatchUserAndProfile(req.userId._id, req.params.id);
  // if they don't match and the user doesn't have admin priv's then prevent access
  // console.log('MATCHES: ', profileUserMatch);
  if ( !profileUserMatch && !req.userId.roles.includes('admin') ) { 
    // console.log('HERE IN NEITHER');
    res.status(401).send('Unable to Access');
  // else, they match! or you're admin, do some more work here
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

// Create `POST /profile`
router.post("/", isLoggedIn, async (req, res, next) => {
  // find out if the userId._id and the OrderID's user._id match
  // const orderUserMatch = await orderDAO.findMatchUserAndOrder(req.userId._id, req.params.id);
  // if they don't match and the user doesn't have admin priv's then prevent access
  // if ( !orderUserMatch && !req.roles.includes('admin') ) { 
  
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
    console.log('EMPTY PROFILE PROFILE ', req.body);
    res.status(401).send('Empty Profiles Cannot be Created');
  } else {
    next();
  }
}, async (req, res, next) => {
  // Middleware Handle the Inputs
  const profile = req.body;
  // console.log('make me sense: ', profile._id);
  // let lclId = new mongoose.Types.ObjectId(profile.userId);
  // console.log('Profile Route? find userID, ', profile);

  const newProfile = {
    'userId': profile.userId,
    'name':  profile.name,
    'address':  profile.address,
    'callSign': profile.callSign,
    'licenseClass': profile.licenseClass
  }
  try {
    // console.log('item order created', newOrder);
    const itemCreated = await profileDAO.createItem(newProfile); 
    res.status(200).json(itemCreated); 
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

//  Get specific profile for all logged in users, even when not logged in
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
