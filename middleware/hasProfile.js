const { Router } = require("express");
const router = Router();
const profileDAO = require('../daos/profile');

// hasProfile middleware, checks to see if LOGGED IN USER has a profile
// userId mbr signed in with token; find out if logged in member has a profile
// (admin can't create requests)
router.use("/", async (req, res, next) => {
  // console.log(req.userId);
  // console.log('In has Profile!');
  const profile = await profileDAO.findByUserModelId(req.userId._id);
  //console.log('profile: ', profile);
  // console.log('ISAUTHORIZED', roles);
    if (!profile) {
      res.status(401).send('User has no profile, just an account');
    } else {
      req.profile = profile;
      next();
    }
});

module.exports = router;