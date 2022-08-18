var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var { extract_fields, fields_verification } = require("../../utils/parser");
var { ObjectId } = require("mongodb");

const requiredFields = ["subject", "options", "creatorId"];
const uniqueFields = [];
router.get("/", async function (req, res, next) {
  const body = req.body;
  console.log(req.headers);
  console.log(req.cookies);
  connection.connectToServer(async (err, db) => {
    if (err) {
      res.status(500).send(`ERROR:\n${error}`);
      return;
    }
    const condition = body?._id ? { _id: ObjectId(body?._id) } : {};
    try {
      const polls = await db.collection("poll").find(condition).toArray();
      res.send(polls);
    } catch (error) {
      res.status(500).send(`ERROR:\n${error}`);
    }
  });
});

module.exports = router;
