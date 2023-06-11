const { Router } = require("express");
const router = Router();
const userDAO = require('../daos/user');


// Middleware isAuthorized(req, res, next) - returns req.roles set to array of String, including admin.
// (will not set req.roles for regular user.  should check if the user has a valid token 
// and if so make req.userId = the userId associated with that token. The token will be 
// coming in as a bearer token in the authorization header (i.e. req.headers.authorization = 
// 'Bearer 1234abcd') and you will need to extract just the token text. Any route that says 
// "If the user is logged in" should use this middleware function.
router.use("/", async (req, res, next) => {
  console.log("HERER ",req.userId);
  const roles = await userDAO.getRoles(req.userId._id);
  console.log('ISAUTHORIZEDOrdes: ', roles);
    if (!roles) {
      res.status(403).send('User has no roles');
    } else {
      req.roles = roles;
      next();
    }
});

module.exports = router;