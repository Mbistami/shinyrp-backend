var express = require("express");
var router = express.Router();
const connection = require("../modules/conn");
const { Binary, BinData, ObjectId } = require("mongodb");

/* GET home page. */
router.post("/", function (req, res, next) {
  console.log(req.body);
  if (!req.body?.userIds) {
    res.status(403).send("?userId=<userId> is required");
    return;
  }
  connection.connectToServer(async () => {
    const db = connection.getDb();
    console.log(req.body.userIds);
    const user = await db
      .collection("users")
      .find({ _id: { $in: req.body.userIds } })
      .toArray((err, result) => res.json(result));
  });
});

module.exports = router;
