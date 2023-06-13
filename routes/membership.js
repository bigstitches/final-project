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
const isWithRoles = require('../middleware/isWithRoles');
const hasProfile = require('../middleware/hasProfile');
const isExistenceOfClub = require('../middleware/isExistenceOfClub');
const isNewRequest = require('../middleware/hasACTIVEorPENDINGrequest');
const router = Router();
const hasMbrRequest = require('../middleware/hasMbrRequest');
const hasMbrRequestADMIN = require('../middleware/hasMbrRequestADMIN');

//  ADMIN users can update the request to RESCINDED or ACTIVE
//  Owners of the club can update the request to rescinded or active
//  IF they are owners of that club
router.put("/:id", isLoggedIn, isExistenceOfClub, async (req, res, next) => {
  // only admin can update a request with another profile (not their own)
  req.profileId = req.params.id;
  if ( !req.userId.roles.includes('admin') ) { 
    // check to see if logged in member owns this club
    try {
      // Pass a function to map
      // check to see if the logged-in/token is in the 'owner'/userId array
      let match = false;
      req.club.userId.forEach((owners) => {
        // console.log('in map', owners.toString());
        if (owners.toString() === req.userId._id) {
          match = true;
        }
      });
      if (match) {
        next();
      } else {
        res.status(401).send('Unable to update this request');
      }
    } catch {
      res.status(401).send('Unable to update this request');
    }
  } else {
    next();
  }
}, hasMbrRequestADMIN, async (req, res, next) => {  
  try {
    const membership = await membershipDAO.findByIdUpdate(req.status._id, {status: req.body.status});
    res.status(200).json(membership); 
  } catch(e) {
    console.log("ERROR: ", e);
    next(e);
  }
}); // end PUT /:id

// 12JUN passing tests
// Create `POST /club/clubId/membership/` - only available to logged in users with a profile.  
router.post("/", isLoggedIn, isExistenceOfClub, async (req, res, next) => {
  //console.log('IN POST ');
  //console.log('club: ', req.club);
  next();
}, hasProfile, isNewRequest, async (req, res, next) => {
  //console.log('req.profile ', req.profile);
  try {
    const mbrRequest = {
      profileId: req.profile._id,
      clubId: req.club._id,
      status: 'PENDING'
    }
    const membershipCreated = await membershipDAO.createItem(mbrRequest);
    //console.log('created mbrship POST/ ', membershipCreated);
    res.status(200).json(membershipCreated); 
  } catch(e) {
    //console.log('In error', e.message);
    res.status(400).send(e);
  }
});

//  Read Status of a request IF ADMIN OR THAT USER
router.get("/:id", isLoggedIn, isWithRoles, isExistenceOfClub, async (req, res, next) => {
  // if admin, assign profileId if the profile exists:
  if (req.roles.includes('admin')){
    // use the params id, not the logged in administrators
    const profile = await profileDAO.findById(req.params.id);
    if (!profile) {
      res.status(401).send('User has no profile, no requests available');
    } else {
      req.profileId = profile._id;
      next();
    } 
  // if not admin, get the userId (from token) DISREGARD params (in case they don't match)
  } else {
    const profile = await profileDAO.findByUserModelId(req.userId._id);
    // will only look at user with token's membership requests
    if (!profile) {
      res.status(401).send('User has no profile, just an account');
    } else {
        req.profileId = profile._id;
        next();
    }
  }
}, hasMbrRequest, async (req, res, next) => {
  res.status(200).json(req.status); 
}); // end GET /:id

// `GET /members` for club, when logged in
// ADMIN and OWNERS get all requests for that club (future** 'RESCINDED' delete after some period of time or option to delete?)
router.get("/", isLoggedIn, isExistenceOfClub, isWithRoles, async (req, res, next) => {
  next();
}, async (req, res, next) => {
  // console.log('club exists');
  try {
    const members = await membershipDAO.getMembers(req.club._id);
    if (members.length === 0) {
      res.status(200).json("No Members of this Club"); 
    } else {
      res.status(200).json(members); 
    }
  } catch (error) {
    res.status(500).json(error); 
  }
});

//  Remove a member from the club and change status to rescinded
// ** NEEDS ERROR HANDLING
router.delete("/:id", isLoggedIn, isExistenceOfClub, async (req, res, _next) => {
  //console.log('IN DELETE: ', match[1]); // the club works
  //console.log('club id: ', req.baseUrl);
  //console.log(req.query.clubId);
  //console.log(req.body.clubId);
  //console.log('club id: ', req.params);
  // console.log('SAME ', req.params.id) // the user works
  // does club exist
  // does profile exist
  // does profile exist in club as active
  // status: PENDING, ACTIVE, RESCINDED
  try {
    const profiles = await membershipDAO.getProfiles();
    res.status(200).json(profiles); 
  } catch (error) {
    res.status(500).json(error); 
  }
});

module.exports = router;
