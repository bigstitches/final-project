const { Router } = require("express");
const router = Router();
const clubDAO = require('../daos/club');


// Middleware isExistenceOfClub - gets club ID using regex
// finds out if club exists, sets req.club to the result if it exists
router.use("/", async (req, res, next) => {
  const regex = /\/club\/(.*?)\/membership/;
  let match = req.baseUrl.match(regex);
  const club = await clubDAO.getById(match[1]);
  // console.log('ISAUTHORIZEDOrdes: ', roles);
    if (!club) {
      res.status(401).send('Club Does not exist');
    } else {
      req.club = club;
      next();
    }
});

module.exports = router;