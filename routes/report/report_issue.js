var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");

/* GET home page. */
router.post("/", function (req, res, next) {
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    const issues = await db
      .collection("issues")
      .find({ id: req.body.discord_id, active: true })
      .toArray();
    if (issues.length > 0) {
      res.status(409).send("already active request");
      return;
    }
    const new_issue = {
      active: true,
      id: req.body.discord_id,
      description: req.body.description,
    };
    await db.collection("issues").insertOne(new_issue);
    res.send(new_issue);
  });
});

module.exports = router;
