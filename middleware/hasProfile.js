const { Router } = require("express");
const { ProfilingLevel } = require("mongodb");
const router = Router();
const profileDAO = require('../daos/profile');


// Middleware isAuthorized(req, res, next) - returns req.roles set to array of String, including admin.
// (will not set req.roles for regular user.  should check if the user has a valid token 
// and if so make req.userId = the userId associated with that token. The token will be 
// coming in as a bearer token in the authorization header (i.e. req.headers.authorization = 
// 'Bearer 1234abcd') and you will need to extract just the token text. Any route that says 
// "If the user is logged in" should use this middleware function.
router.use("/", async (req, res, next) => {
  // console.log(req.userId);
  const profile = await profileDAO.findById(req.userId._id);
  // console.log('ISAUTHORIZED', roles);
    if (!profile) {
      res.status(401).send('User has no profile, just an account');
    } else {
      res.profile = profile;
      next();
    }
});

module.exports = router;