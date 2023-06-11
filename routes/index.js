const { Router } = require("express");
const router = Router();

router.use("/login", require('./login'));
router.use("/login/signup", require('./login'));
//router.use("/items", require('./items'));
router.use("/health", require('./health'));
router.use("/profile", require('./profile'));
router.use("/profile/:id", require('./profile'));
router.use("/club", require('./club'));
router.use("/club/:clubId/membership", require('./membership'));
// capture errors when the transactionid is not valid
// use an error handling middleware - put it last
router.use((err, _req, res, _next) => {
  if (err.message.includes("Cast to ObjetId failed")) {
      res.status(400).send('Invalid id provided');
  } else {
      // 500 internal server error, client can't fix
      res.status(500).send('something broke!');
      console.log('unexpected error: ', err)
  }
});

router.get("/", (req, res, next) => {
  res.send(`
    <html>
      <body>
        <h1> FINAL PROJECT in more progressions </h1>
      </body>
    </html>
  `)
});

module.exports = router;