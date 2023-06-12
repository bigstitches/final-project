const { Router } = require("express");
const router = Router();
const membershipDAO = require('../daos/membership');


router.use("/", async (req, res, next) => {
  // console.log(req.userId);
  // console.log('In has active or pending middleware!');
  // console.log('expect profile id: ', req.profile._id);
  // console.log('expect club: ', req.club);
  // requires other middleware before this can be called successfully
  try {
    const status = await membershipDAO.getStatus(req.profile._id, req.club._id);
    req.status = status;
    next();
  } catch(e) {
    res.status(401).send('User does not have a request for this club');
  }
});

module.exports = router;