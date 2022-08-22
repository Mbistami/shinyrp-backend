var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var { extract_fields, fields_verification } = require("../../utils/parser");

const requiredFields = ["subject", "options", "creatorId"];
const uniqueFields = [];
router.post("/", async function (req, res, next) {
  console.log(req.body);
  const verification = await fields_verification(
    requiredFields,
    req.body
  ).catch((err) => {
    console.error(err);
    res
      .status(400)
      .send(`missing required fields: ${requiredFields.join(" ")}`);
    return 1;
  });
  if (verification) return;
  const newPoll = await extract_fields(requiredFields, req.body);
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(`ERROR!${error}`);
      return;
    }
    newPoll.date = new Date().getTime();
    newPoll.votes_ids = [];
    try {
      await db.collection("poll").insertOne(newPoll);
      var optionsLength = req.body.options.length;
      while (optionsLength > 0)
        await db.collection("votes").insertOne({
          poll_id: newPoll._id.toString(),
          option: optionsLength--,
          votes: 0,
        });
      res.send(newPoll);
    } catch (error) {
      res.status(500).send(`ERROR!${error}`);
    }
  });
});

module.exports = router;
