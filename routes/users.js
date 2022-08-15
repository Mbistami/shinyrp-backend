var express = require("express");
var router = express.Router();
const connection = require("../modules/conn");
const { Binary, BinData, ObjectId } = require("mongodb");

/* GET users listing. */
function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
router.get("/", async (req, res, next) => {
  connection.connectToServer(async () => {
    const dbConnection = await connection.getDb();

    const buff = new Buffer.from("7UGhGWl4LHGvFS2gTLf5lg==", 3);
    dbConnection
      .collection("users")
      .find({
        street: "Twin center 5th floor ",
      })
      .toArray(async (err, employees) => {
        const data = await dbConnection.collection("users").aggregate([
          { $match: { type: "MOOD" } },
          {
            $group: {
              _id: { createdAt: "$createdAt" },
              count: {
                $sum: 1,
              },
              vote: {
                $first: "$vote",
              },
            },
          },
        ]);
      });
  });
});

module.exports = router;
