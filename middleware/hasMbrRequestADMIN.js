const { Router } = require("express");
const router = Router();
const membershipDAO = require('../daos/membership');

// don't use admin's id, use the parameters
router.use("/", async (req, res, next) => {
  // console.log(req.userId);
  //console.log('In has active or pending middleware ADMIN!');
  //console.log('expect club: ', req.club);
  //console.log('expect params: ', req.profileId);
  // requires other middleware before this can be called successfully
  try {
    const status = await membershipDAO.getMembership(req.profileId, req.club._id);
    // console.log('in middleware status ', status);
    req.status = status;
    next();
  } catch(e) {
    res.status(401).send('id does not have a request for this club');
  }
});

module.exports = router;