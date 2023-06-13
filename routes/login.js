const { Router } = require("express");
const bcrypt = require('bcrypt');
const router = Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'JSoNToKen45OO!GoTeam';

const isLoggedIn = require('../middleware/isLoggedIn')
const hashPassword = require('../middleware/hashPassword')
const requirePassword = require('../middleware/requirePassword')
const userDAO = require('../daos/user');

// Form to SignUp
router.get('/', (req, res, next) => {
  try {
      res.render('login');
  } catch(e) {
      console.error(e);
      next(e);
  }
});

// Signup; should use bcrypt on the incoming password. Store user with their email and 
// encrypted password, handle conflicts when the email is already in use.
router.post("/signup", async (req, res, next) => {
  // middleware check for an email address
  if (!req.body.email || JSON.stringify(req.body.email) === '{}' ) {
    res.status(400).send('email is required');
  } else {
    const existingUser = await userDAO.getUser(req.body.email);
    if (!existingUser) {
      next();
    } else {
      res.status(409).send('email already exists');
    }
  }
// put middleware in line
}, requirePassword, async (req, res, next) => {
    let savedHash;
    async function logHash(hash) {
      // console.log(`Hash for ${password} is ${hash}`);
      savedHash = hash;
      const newUser = {
        "email": req.body.email,
        "password": savedHash,
        'roles': ['user']
      }
      try {
        const createdUser = await userDAO.createUser(newUser);
        console.log("CREATED USER", createdUser);
        res.sendStatus(200);
        res.json(createdUser);
      } catch(e) {
        // console.log('HERE: ', e);
        if (e instanceof userDAO.BadDataError) {
          res.status(409).send(e.message);
        } else if (e.code === 11000 ) {
          res.status(409).send(`${e.keyValue} is not unique`);
        } 
      }
    }
    bcrypt.hash(req.password, 1).then(logHash);
});

// Login, find the user with the provided email. Use bcrypt to compare stored 
// password with the incoming password. If they match, generate a random token with 
// uuid and return it to the user. 
// require a password and check wither logged in
router.post("/", requirePassword, async (req, res, next) => {
  // middleware check user exists
  req.email = req.body.email;
  req.existingUser = await userDAO.getUser(req.email);
  // if (req.roles) {console.log('ROLES: ', req.roles)};
  if (!req.existingUser) {
    res.status(401).send('Not a registered user');
  } else {
    req.roles = await userDAO.getRoles(req.existingUser._id);
    next()  
  }      
}, async (req, res, _next) => {
  // endpoint bcrypt compare 
  bcrypt.compare(req.body.password, req.existingUser.password, async (err, result) => {
    if (err) {
      console.log("bcrypt compare: ", err);
      res.sendStatus(400).send(err);
    } else if (!result) {
      // console.log('error: ', result, ' ', req.body.password, ' ', req.existingUser.password)
      res.status(401).send('invalid password');
      // need to set 400 but cannot set headers after they are set by client
    } else {
      try {
        res.status(200).json({token: jwt.sign({ 
          email: req.email, 
          _id: req.existingUser._id, 
          roles: req.roles
        }, JWT_SECRET)});
      } catch (error) {
        console.log('this token login: ', error);
      }
    }  
  });
});

// Signup; If the user is logged in, store the incoming password using their userId
router.post("/password", requirePassword, isLoggedIn, hashPassword, async (req, res, next) => {
  if (!req.userId) res.status(500).send(`password not changed.`);
  try {
    await userDAO.updateUserPassword(req.userId, req.password);
    res.status(200).send('password updated: ');
  } catch (error) {
    res.status(500).send(`password not changed. Error Message: ${error}`);
  }
});



module.exports = router;

