var express = require("express");
var router = express.Router();
const connection = require("../modules/conn");
const { Binary, BinData, ObjectId } = require("mongodb");

/* GET home page. */
router.get("/", async (req, res, next) => {
  connection.connectToServer(async () => {
    const db = connection.getDb();
    const data = await db.collection("users").aggregate([
      {
        $match: { type: "MOOD" },
      },
      {
        $project: {
          day: { $substr: ["$createdAt", 0, 10] },
          vote: 1,
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$day",
          count: { $sum: 1 },
          votes: {
            $push: "$vote",
          },
          day: {
            $first: "$createdAt",
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    const resulting = [];
    var stopAt = 30;
    for await (var doc of data) {
      console.log(doc);
      // doc.data = doc.data?.filter((vote) => vote === resulting.length);
      stopAt--;
      if (stopAt === 0) break;
      resulting.push(doc);
    }
    res.json(resulting);
  });
});

module.exports = router;
