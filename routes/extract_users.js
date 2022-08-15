var express = require("express");
var router = express.Router();
const connection = require("../modules/conn");
const { Binary, BinData, ObjectId } = require("mongodb");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (!req.query?.date) {
    res.status(403).send("?date=<DATE> is required");
    return;
  }
  connection.connectToServer(async () => {
    const db = connection.getDb();

    const data = db.collection("users").aggregate([
      {
        $project: {
          day: { $substr: ["$createdAt", 0, 10] },
          vote: 1,
          createdAt: 1,
          ownerId: 1,
        },
      },
      { $match: { day: req.query.date, vote: parseInt(req.query.type) } },
      //   { $match: { vote: req.query.type } },
    ]);
    const resulting = [];
    for await (var doc of data) {
      console.log(doc, 1);
      resulting.push(doc);
    }
    console.log(req.query.type);
    res.json(resulting);
  });
});

module.exports = router;
