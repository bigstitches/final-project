const { Router } = require("express");
const router = Router();

router.get("/", (req, res, next) => {
  res.send(`
    <html>
      <body>
        <h1> healthy - checks railway deployment </h1>
      </body>
    </html>
  `).status(200);
});
module.exports = router;
