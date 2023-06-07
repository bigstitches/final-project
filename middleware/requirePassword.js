const { Router } = require("express");
const router = Router();

// Middleware checks for password, stops flow & return 400 if password not provided
router.use("/", async (req, res, next) => {
  req.password = req.body.password;
  if (!req.password || JSON.stringify(req.password) === '{}' ) {
    // console.log('missingpassword');
    res.status(400).send('password is required');
  } else {
    next();
  }
});

module.exports = router;