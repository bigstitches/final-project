const { Router } = require("express");
const router = Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'JSoNToKen45OO!GoTeam';

// Middleware isLoggedIn(req, res, next) - should check if the user has a valid token 
// and if so make req.userId = the userId associated with that token. The token will be 
// coming in as a bearer token in the authorization header (i.e. req.headers.authorization = 
// 'Bearer 1234abcd') and you will need to extract just the token text. Any route that says 
// "If the user is logged in" should use this middleware function.
router.use("/", async (req, res, next) => {
  
  let token = req.headers.authorization;
  // console.log('HERE, ', token);
    if (!token) {
      // console.log('no token');
      res.status(401).send('Authoization not provided. Session not authenticated.');
    } else {
      token = token.split(' ')[1];
      try {
        req.userId  = jwt.verify(token, JWT_SECRET);
        // console.log('Sucessful LoginProfile, ', req.userId);
        next();
      } catch (error) {
        // console.log(error);
        res.status(401).send(`${error}, Token does not exist. Session not authenticated.`);
      }
    }
});

module.exports = router;