var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");

router.get("/", function (req, res, next) {
  const searchString = req.query?.search;
  if (!searchString) {
    res.status(500).send("*search* field is required!");
    return;
  }
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(`ERROR\n${err}`);
      return;
    }
    // await db.collection("users").createIndex({ "$**": "text" });
    const cursor = await db
      .collection("users")
      .find({ $text: { $search: searchString } })
      .toArray();
    res.send(cursor);
  });
});

module.exports = router;
