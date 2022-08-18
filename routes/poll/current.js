var express = require("express");
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
      const polls = await db
        .collection("poll")
        .find({})
        .sort({ date: -1 })
        .limit(1)
        .toArray();
      res.send(polls);
    } catch (error) {
      res.status(500).send(`ERROR:\n${error}`);
    }
  });
});

module.exports = router;
