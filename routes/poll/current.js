var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var connection = require("../../modules/conn");
var { extract_fields, fields_verification } = require("../../utils/parser");

const requiredFields = ["subject", "options", "creatorId"];
const uniqueFields = [];
router.get("/", async function (req, res, next) {
  const body = req.body;
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(`ERROR:\n${error}`);
      return;
    }
    try {
      var polls = await db
        .collection("poll")
        .find({})
        .sort({ date: -1 })
        .limit(1)
        .toArray();
      polls = polls[0];
      let count = await db
        .collection("votes")
        .find({ poll_id: polls._id.toString() })
        .toArray();
      let total = 0;
      await count.map((e) => (total += e?.votes));
      res.send({ ...polls, total });
    } catch (error) {
      res.status(500).send(`ERROR:\n${error}`);
    }
  });
});

module.exports = router;
