var express = require("express");
var router = express.Router();
var connection = require("../modules/conn");
var jwt_decode = require("jwt-decode");
var { ObjectId } = require("mongodb");

/* GET home page. */
router.get("/", function (req, res, next) {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];

    connection.connectToServer(async (err, db) => {
      if (err) {
        res.status(500).send("ERROR\nconnection to database faild");
        return;
      }
      const decoded = jwt_decode(token);
      const user = await db
        .collection("users")
        .find({ _id: ObjectId(decoded?._id) })
        .toArray();
      res.send(...user);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("ERROR!");
  }
});

module.exports = router;
