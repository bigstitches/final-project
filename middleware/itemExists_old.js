const { Router } = require("express");
const router = Router();
const itemDAO = require('../daos/items');

// function to check whether value exists in our placeholder array
// (REF) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
function checkAvailability(arr, val) {
  // returns bool
  let doc = (arr.some((arrVal) => {
    val === arrVal.item;
    // console.log('CHECKAVAILABILITY: ', val, ' ', arrVal.item);
  }));
  
  return arr.some((arrVal) => val === arrVal.item);
}

// Middleware finds the item that matches both title and price, returns req.itemId
router.use("/", async (req, res, next) => {
  // console.log('check item existence', req.itemObjectArray);
  req.itemObjectArrayApproved = [];
  req.total = 0;

  // Function checks whether an element exists in the itemObjectArrayApproved ALREADY
  const knownMatchFindIndex = (element) => {
    // console.log('Here ', element);
    for (let index = 0; index < req.itemObjectArrayApproved.length; i++) {
      // console.log('Here ', element, ' ', req.itemObjectArrayApproved[index].item);
      if (req.itemObjectArrayApproved[index].item === element) {
        // console.log('match ', req.itemObjectArrayApproved[index].item);
        
        req.itemObjectArrayApproved[index].quantity = req.itemObjectArrayApproved[index].quantity + 1;
        // console.log(req.itemObjectArrayApproved[index].quantity);
        return;
      }
    }
  }

  for (let i = 0; i < req.itemObjectArray.length; i++) {
    let item = req.itemObjectArray[i];
    let qty = 1;
    
    // see if the item exists
    try {
      const itemFound = await itemDAO.findById(item);
      // console.log("try: ", itemFound);
      /*
      try:  {
      _id: new ObjectId("64637af752519a0ba3b45c47"),
      title: 'Second Item',
      price: 12,
      __v: 0
      }
      */
      const compareItem = `${itemFound._id}`;
      const inputItem = `${itemFound._id}`;
      // console.log(compareItem);
      // '64637e0bf5a8704cf3747d55'
      if (checkAvailability(req.itemObjectArrayApproved, compareItem)) {
        knownMatchFindIndex(compareItem);
      } else {
        // console.log('PUSHED: item: ', inputItem, ' quantity: ', qty);
        req.itemObjectArrayApproved.push({'item': inputItem, 'quantity': qty});
      }
      req.total++;
    } catch (e) {
      // console.log(`${item} is not a real item; attempting to adding another`);
      res.status(400).send(`Item is not a real item; Order creation stopped`);
    }
    // console.log('in for loop');
  }// end for loop
  // console.log('out of for loop');
  if (req.itemObjectArrayApproved.length === 0) {
    console.log(req.userId, ' ',req.itemObjectArrayApproved, ' ', req.total);
    res.status(401).send('Nothing in this cart is real');
  } else {
    console.log(req.userId._id, ' ',req.itemObjectArrayApproved, ' ', req.total);
    /*
      [
      { item: '64639c1127aad64869fdb1ce', quantity: 2 },
      { item: '64639c1127aad64869fdb1cd', quantity: 1 }
      ]   3
    */
    next();
  }

});

module.exports = router;
// 5f1b8d9ca0ef055e6e5a1f6b