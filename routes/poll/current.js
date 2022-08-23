var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var connection = require("../../modules/conn");
var { get_user } = require("../../utils/parser");

router.get("/", async function (req, res, next) {
  const user = get_user(req);
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
      const userVote = polls?.votes_ids.find(
        (e) => e.user == user?._id.toString()
      );
      res.send({
        ...polls,
        total,
        isVoted: Boolean(userVote),
      });
    } catch (error) {
      res.status(500).send(`ERROR:\n${error}`);
    }
  });
});

module.exports = router;
