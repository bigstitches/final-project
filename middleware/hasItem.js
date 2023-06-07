const { Router } = require("express");
const router = Router();
const itemDAO = require('../daos/items');

// Middleware finds the item that matches both title and price, returns req.itemId
router.use("/", async (req, res, next) => {
  try {
    const itemFound = await itemDAO.findById(req.path.split('/')[1]);
    req.itemId = itemFound._id;
    next();
  } catch (error) {
    console.log('not a real item');
    next(error);
  }
});

module.exports = router;