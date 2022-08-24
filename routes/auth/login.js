var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var jwt = require("jsonwebtoken");
var { fields_verification, generate_condition } = require("../../utils/parser");
const { body, validationResult } = require("express-validator");

/* GET home page. */
const requiredFields = ["name", "username", "email", "password"];
const uniqueFields = ["username", "password"];
router.post("/", async (req, res, next) => {
  const body = req.body;
  if (
    (await fields_verification(uniqueFields, body).catch((err) => {
      console.log(err);
      res.status(400).send(err);
      return -1;
    })) < 0
  )
    return;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  connection.connectToServer(async (err, db) => {
    console.log("cookie!", await generate_condition(uniqueFields, body));
    const collection = await db
      .collection("users")
      .find({ $and: await generate_condition(uniqueFields, body) }) // => {$and: [{username: value}, {password: value}]]}
      .toArray()
      .catch(() => {
        console.log("error");
      });
    console.log(collection.length);
    if (collection.length > 0) {
      console.log("cookie!");
      res.cookie(
        "shinyrp-auth-cookie",
        jwt.sign(...collection, process.env.SECRET_TOKEN, {
          expiresIn: "1800s",
          algorithm: "HS256",
        }),
        {
          maxAge: 900000,
          domain: ".shinyrp.dk",
          sameSite: "none",
          httpOnly: false,
          secure: true,
        }
      );
      console.log("cookie!");
      res.send();
      return;
    }
  });
});

module.exports = router;
