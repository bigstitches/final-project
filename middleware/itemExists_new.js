const { Router } = require("express");
const router = Router();
const itemDAO = require('../daos/items');

// Middleware ensure each item exists; while you have the object update the total 
// and add itemFound._id to an array to pass to next()
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