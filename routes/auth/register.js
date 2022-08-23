var express = require("express");
var router = express.Router();
var connection = require("../../modules/conn");
var jwt = require("jsonwebtoken");
var { fields_verification, generate_condition } = require("../../utils/parser");
const { body, validationResult } = require("express-validator");

/* GET home page. */
const requiredFields = [
  "name",
  "username",
  "email",
  "password",
  "first_name",
  "second_name",
  "pfp",
  "birthday",
];
const uniqueFields = ["username", "email"];
router.post(
  "/",
  body("username")
    .isLength({ min: 4 })
    .withMessage("username must be 4 chars long")
    .matches(/^(?=[a-zA-Z0-9._])(?!.*[_.]{2})[^_.].*[^_.]/)
    .withMessage("symbol not allowed in username"),
  body("email").isEmail().withMessage("not valid e-mail!"),

  async (req, res, next) => {
    const body = req.body;
    if (
      (await fields_verification(requiredFields, body).catch((err) => {
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
      newUser.created_at = new Date().getTime();
      newUser.role = ["user"];
      try {
        await db.collection("users").insertOne(newUser);
        res.cookie(
          "shinyrp-auth-cookie",
          jwt.sign(newUser, process.env.SECRET_TOKEN, {
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
        res.status(200).send(newUser);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });
  }
);

module.exports = router;
