const { get_user } = require("../utils/parser");
const connection = require("../modules/conn");

const verify_duplicates = (collection, req) => {};

const link_discord_user = (collection, req) => {
  collection("users").find({});
};

const is_id_linked = (newUser, db) =>
  new Promise(async (resolve, rej) => {
    const users = await db
      .collection("users")
      .find({ id: newUser?.id })
      .toArray();
    if (users && users?.length > 0) resolve(true);
    else resolve(false);
  });

const push_request = (req, res) => {
  return new Promise(async (resolve, rej) => {
    const user = get_user(req);
    const { choices, age, staff_known, staff_known_description } = req.body;
    connection.connectToServer(async (err, db) => {
      if (err) {
        res.status(500).send(err);
        rej('has pending request');
        return;
      }
      const requests = await db
        .collection("requests")
        .find({ id: user?.id })
        .toArray();
      console.log(requests);
      if (requests.find((e) => e?.status === "pending")) {
        res.status(409).send("has pending request");
        rej('has pending request');
        return;
      }
      // try {
        const request = {
          ...user,
          dailyDuration: 1,
          choices,
          age,
          staff_known,
          status: "pending",
          staff_known_description,
          created_at: new Date().toISOString(),
        };
        delete request['_id'];
        await db.collection("requests").insertOne(request);
        console.log(request);
        res.send(request);
        resolve(request);
      // } catch (error) {
      //   res.status(500).send(error);
      //   rej(error);
      // }
    });
  });
};

module.exports = { is_id_linked, push_request };
