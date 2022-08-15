var express = require("express");
var axios = require("axios");
var router = express.Router();
var { v4 } = require("uuid");

/* GET home page. */
const sessions = [];
router.get("/", function (req, res, next) {
  console.log(req.headers);
  if (req.headers?.authorization) {
    const authorization = req.headers?.authorization;
    axios
      .get(`${process.env.API_AUTH_LINK}/auth/getUserUsingJwt`, {
        headers: { authorization },
      })
      .then((res_) => {
        console.log(res_);
        if (res_.status === 200) {
          const uuid = v4();
          sessions.push({ uuid, authorization });
          console.log(sessions, res);
          res.send({ uuid });
        } else res.sendStatus(403);
      })
      .catch((err) => console.log(err));
  } else if (req.query?.uuid) {
    console.log(sessions);
    res.send(sessions.find((e) => e.uuid === req.query.uuid));
  }
});

module.exports = router;
