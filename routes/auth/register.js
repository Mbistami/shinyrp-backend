var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var { fields_verification, generate_condition } = require("../../utils/parser");

/* GET home page. */
const requiredFields = ["name", "username", "email", "password"];
const uniqueFields = ["username", "email"];
router.post("/", async (req, res, next) => {
  const body = req.body;
  if (
    (await fields_verification(requiredFields, body).catch((err) => {
      console.log(err);
      res.status(400).send(err);
      return -1;
    })) < 0
  )
    return;

  connection.connectToServer(async (err, db) => {
    const collection = await db
      .collection("users")
      .find({ $or: await generate_condition(uniqueFields, body) })
      .toArray();
    if (collection.length > 0) {
      const user = collection.find((e) => {
        if (e.email === body.email || e.username === body.username) return e;
      });
      res
        .status(409)
        .send(
          `${(user && user?.username) || ""} ${(user && user?.email) || ""}`
        );
      return;
    }
    const newUser = {};
    requiredFields.map((e) => (newUser[e] = body[e]));
    try {
      await db.collection("users").insertOne(newUser);
      res.status(200).send(newUser);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });
});

module.exports = router;
