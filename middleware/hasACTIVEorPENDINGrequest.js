const { Router } = require("express");
const router = Router();
const membershipDAO = require('../daos/membership');


router.use("/", async (req, res, next) => {
  // console.log(req.userId);
  // console.log('In has active or pending middleware!');
  // console.log('expect profile id: ', req.profile._id);
  // console.log('expect club: ', req.club);
  // requires other middleware before this can be called successfully
  const status = await membershipDAO.getStatus(req.profile._id, req.club._id);
  // console.log('ISAUTHORIZED', roles);
  if (!status) {
    // good, brand new status can be made
    next();
    /*
    future
  } else if (status === 'RESCINDED') {
    // maybe add some wait period here...
    next();
  } else if (status === 'ACTIVE') {
    res.status(401).send('User is already a member');
    */
  } else {
    res.status(401).send('User has a pending request');
  }
});

module.exports = router;