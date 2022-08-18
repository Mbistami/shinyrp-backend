var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var jwt = require("jsonwebtoken");
var { fields_verification, generate_condition } = require("../../utils/parser");

/* GET home page. */
const requiredFields = ["name", "username", "email", "password"];
const uniqueFields = ["username", "password"];
router.options("/", async (req, res, next) => {
  const body = req.body;
  if (
    (await fields_verification(uniqueFields, body).catch((err) => {
      console.log(err);
      res.status(400).send(err);
      return -1;
    })) < 0
  )
    return;

  connection.connectToServer(async (err, db) => {
    const collection = await db
      .collection("users")
      .find({ $and: await generate_condition(uniqueFields, body) })
      .toArray();
    if (collection.length > 0) {
      res.cookie(
        "shinyrp-auth-cookie",
        jwt.sign(...collection, process.env.SECRET_TOKEN, {
          expiresIn: "1800s",
        }),
        { maxAge: 900000, domain: ".herokuapp.com", secure: true }
      );
      res.send();
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
