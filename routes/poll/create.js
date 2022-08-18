var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var { extract_fields, fields_verification } = require("../../utils/parser");

const requiredFields = ["subject", "options", "creatorId"];
const uniqueFields = [];
router.post("/", async function (req, res, next) {
  const verification = await fields_verification(
    requiredFields,
    req.body
  ).catch((err) => {
    res.send(`missing required fields: ${requiredFields.join(" ")}`);
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
      res.send(newPoll);
    } catch (error) {
      res.status(500).send(`ERROR!${error}`);
    }
  });
});

module.exports = router;
