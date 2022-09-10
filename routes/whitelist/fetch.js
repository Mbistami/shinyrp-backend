var express = require("express");
var router = express.Router();
const connection = require("../../modules/conn");
var { get_user } = require("../../utils/parser");



router.get("/", function (req, res, next) {
    const user = get_user(req);
    connection.connectToServer(async (err, db) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      console.log(user)
      const requests = await db
        .collection("requests")
        .find({ id: user?.id })
        .toArray();
        res.send(requests);
        
    });
  
});

module.exports = router;
