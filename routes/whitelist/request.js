var express = require("express");
var router = express.Router();
const connection = require("../../modules/conn");
const {ObjectId} =require("mongodb");
const { push_request } = require("../../utils/dbVerifications");
const { fields_verification, get_user } = require("../../utils/parser");

router.post("/", async function (req, res, next) {
  const type = req.query?.type;
  if (!type) {
    res.status(400).send("type query required");
    return;
  }
  try {
    console.log(req.body);
    fields = [];
    if (
      type == "requestWhitelist" &&
      (await fields_verification(fields, req.body))
    ) {
      await push_request(req, res);
      // res.send(request);
    } else if (
      type === "accept" &&
      (await fields_verification(["id", "startDate"], req.body))
    ) {
      const user = get_user(req);
      connection.connectToServer(async (err, db) => {
        if (err) throw err;
        const { _id, startDate } = req.body;
        const request = await db.collection("requests").find({ _id: new ObjectId(_id) }).toArray();
        await db.collection("requests").update(
          { _id: new ObjectId(_id) },
          {
            $set: {
              status: "accepted",
              startDate,
              assignedTo: user?.id,
              name: "Whitelist meeting",
              description: `You've been accepted to have a meeting with the staff member ${user?.username}.`,
              dailyDuration: 2
            },
          }
        );
        res.send(request);
      });
    } else if (type === 'archive' && (await fields_verification(["id"], req.body)))
    {
      const user = get_user(req);
      connection.connectToServer(async (err, db) => {
        if (err) throw err;
        const { _id } = req.body;
        const request = await db.collection("requests").find({ _id: new ObjectId(_id) }).toArray();
        await db.collection("requests").update(
          { _id: new ObjectId(_id) },
          {
            $set: {
              archive: true,
              archivedBy: user?.id
            },
          }
        );
        res.send(request);
      });
    }
    else if (type === 'unarchive' && (await fields_verification(["id"], req.body)))
    {
      const user = get_user(req);
      connection.connectToServer(async (err, db) => {
        if (err) throw err;
        const { _id } = req.body;
        const request = await db.collection("requests").find({ _id: new ObjectId(_id) }).toArray();
        await db.collection("requests").update(
          { _id: new ObjectId(_id) },
          {
            $set: {
              archive: false,
              archivedBy: user?.id
            },
          }
        );
        res.send(request);
      });
    }
  } catch (error) {
    console.log(error);
    if (!res.writableFinished) res.status(500).send(error);
    return;
  }
});

module.exports = router;
