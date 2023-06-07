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
    if (!token) {
      res.status(401).send('Authoization not provided. Session not authenticated.');
    } else {
      token = token.split(' ')[1];
      try {
        const { _id } = jwt.verify(token, JWT_SECRET);
        req.userId = _id;
        next();
      } catch (error) {
        res.status(401).send(`${error}, Token does not exist. Session not authenticated.`);
      }
    }
});

module.exports = router;