const { Router } = require("express");
const router = Router();
//const userDAO = require('../daos/user');
//const clubDAO = require('../daos/club');


// Middleware isOwnerofClub - must be AFTER isExistenceOfClub
router.use("/", async (req, res, next) => {
  // req.club = club;
  // console.log("HERER ",req.userId);
  // console.log('ISAUTHORIZEDOrdes: ', roles);
    if (req.club.userId.includes(req.userId._id)) {
      next();
    } else {
      res.status(401).send('You are not an owner');
    }
});

module.exports = router;