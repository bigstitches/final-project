const { Router } = require("express");
const router = Router();
const profileDAO = require('../daos/Profile');

/*
* Middleware checks to see if a complete Profile is being created by Admin
* Should NOT get here on final project, prevent entering if all fields are not 
* filled in, or filled in incorrectly
*/
router.use("/", async (req, res, next) => {
  // console.log('check item existence', req.itemObjectArray);
  req.itemObjectArrayApproved = [];
  req.total = 0;
  let badItem = false;

  for (let i = 0; i < req.itemObjectArray.length; i++) {
    let item = req.itemObjectArray[i];
    
    // TRY see if the item exists, get it's id and price
    try {
      const itemFound = await itemDAO.findById(item);
      req.itemObjectArrayApproved.push(itemFound._id);
      req.total = itemFound.price + req.total;
    } catch (e) {
      badItem = true;
      break;
    }
  }// end for loop

  if (req.itemObjectArrayApproved.length === 0||badItem) {
    res.status(400).send('This cart is a lie.');
  } else {
    // console.log(req.userId._id, ' ',req.itemObjectArrayApproved, ' ', req.total);
    next();
  }

});

module.exports = router;