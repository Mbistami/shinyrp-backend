var express = require("express");
const axios = require("axios");
var router = express.Router();
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const make_config = (authorization_token) => {
  data = {
    headers: {
      authorization: `Bearer ${authorization_token}`,
    },
  };
  return data;
};

router.post("/", function (req, res, next) {
  if (!req.body?.code) {
    res.status(400).send("code required");
    return;
  }
  const data_1 = new URLSearchParams();
  console.log(
    process.env.DISCORD_CLIENT_ID,
    process.env.DISCORD_CLIENT_SECRET,
    req.body
  );
  data_1.append("client_id", process.env.DISCORD_CLIENT_ID);
  data_1.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
  data_1.append("grant_type", "authorization_code");
  data_1.append("redirect_uri", `http://localhost:3001/`);
  //   data_1.append("scope", "identify");
  data_1.append("code", req.body.code);
  console.log(data_1);
  fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    body: data_1,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      axios
        .get(
          "https://discord.com/api/users/@me",
          make_config(data.access_token)
        )
        .then((response) => {
          res.status(200).send(response.data);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        });
    });
});

module.exports = router;
