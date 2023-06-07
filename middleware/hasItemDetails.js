const { Router } = require("express");
const router = Router();

// Middleware checks for password, stops flow & return 400 if password not provided
router.use("/", async (req, res, next) => {
  // console.log('in check item details');
  // console.log(req.body.title, "TITLE");
  // console.log(req.body.price, "PRICE");
  // console.log(req.params.title, "title param");
  // console.log(req.params.price, 'price param');
  req.title = req.body.title;
  req.price = req.body.price;
  if (!req.title || JSON.stringify(req.title) === '{}' ) {
    res.status(400).send('Title is required');
  } else if ( !req.price || req.price < 0 ) {
    res.status(400).send('Price does not meet requirements');
  } else {
    // console.log('out item details');
    next();
  }
});

module.exports = router;