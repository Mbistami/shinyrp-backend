var express = require("express");
var router = express.Router();
var { ObjectId } = require("mongodb");
var connection = require("../../../modules/conn");
var jwt_decode = require("jwt-decode");
var { extract_fields, fields_verification } = require("../../../utils/parser");

const requiredFields = ["subject", "options", "creatorId"];
const uniqueFields = [];
const newVote = (body, currentPoll, vote) => {
  const newVote = {};
  console.log(currentPoll?._id.valueOf());
  currentPoll.votes_ids.push(body.userId);
  newVote.poll_id = currentPoll?._id.toString();
  newVote.date = new Date().getTime();

  newVote.vote = vote;
  return newVote;
};
router.post("/", async function (req, res, next) {
  const body = req.body;
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(`ERROR:\n${error}`);
      return;
    }
    try {
      const user = jwt_decode(req.cookies[process.env.COOKIE_NAME]);
      const polls = await db
        .collection("poll")
        .find({})
        .sort({ date: -1 })
        .limit(1)
        .toArray();
      const currentPoll = polls[0];
      console.log(currentPoll, user, body, user?._id, body.vote);
      if (currentPoll.votes_ids.find((e) => e.user === user?._id))
        throw new Error(`user ${user?._id} already voted!`);
      console.log("test");
      const vote = newVote(user, currentPoll, body.vote);
      await db
        .collection("poll")
        .updateOne(
          { _id: ObjectId(currentPoll._id.toString()) },
          { $push: { votes_ids: { user: user?._id, vote: body.vote } } }
        );
      console.log(vote);
      await db
        .collection("votes")
        .updateOne(
          { poll_id: body.pollId, option: body.vote },
          { $inc: { votes: 1 } }
        );
      const currentRes = await db.collection("votes").aggregate([
        {
          $match: {
            poll_id: body.pollId,
          },
        },
        {
          $group: {
            _id: null,
            sum: { $sum: "$votes" },
            records: {
              $push: {
                option: "$option",
                votes: "$votes",
              },
            },
          },
        },
        {
          $unwind: { path: "$records" },
        },
        {
          $project: {
            option: "$records.option",
            votes: "$records.votes",
            sum: "$sum",
            percent: {
              $multiply: [{ $divide: ["$records.votes", "$sum"] }, 100],
            },
          },
        },
      ]);
      console.log("VOTES:");
      const votes = [];
      for await (const doc of currentRes) votes.push(doc);
      res.send(votes);
      votes.forEach(async (e, i) => {
        const res = await db.collection("poll").updateMany(
          {
            _id: ObjectId(body.pollId),
            "options.option": e?.option,
          },
          { $set: { "options.$.percent": e?.percent.toFixed(2) } }
        );
        console.log(res, body.pollId, e?.option, e?.percent);
      });
    } catch (error) {
      res.status(500).send(`ERROR:\n${error}`);
    }
  });
});

module.exports = router;
