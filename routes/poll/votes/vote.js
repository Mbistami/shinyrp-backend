var express = require("express");
var router = express.Router();
var { ObjectId } = require("mongodb");
var connection = require("../../modules/conn");
var { extract_fields, fields_verification } = require("../../utils/parser");

const requiredFields = ["subject", "options", "creatorId"];
const uniqueFields = [];
const newVote = (body, currentPoll) => {
  const newVote = {};
  currentPoll.vote_ids.push(body.userId);
  newVote.pollId = ObjectId(currentPoll?._id);
  newVote.date = new Date().getTime();
  newVote.option = body.option;
  newVote.userId = body.userId;
  newVote.votedOption = body.voted
};
router.get("/", async function (req, res, next) {
  const body = req.body;
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(`ERROR:\n${error}`);
      return;
    }
    try {
      const polls = await db
        .collection("poll")
        .find({})
        .sort({ date: -1 })
        .limit(1)
        .toArray();
      const currentPoll = polls[0];
      if (currentPoll.vote_ids.includes(body.userId))
        throw new Error(`user ${body.userId} already voted!`);
      const vote = newVote(body, currentPoll);
      await db.collection("votes").insertOne(vote);

    } catch (error) {
      if (polls.length === 0) res.status(404).send("No running polls");
      res.status(500).send(`ERROR:\n${error}`);
    }
  });
});

module.exports = router;
