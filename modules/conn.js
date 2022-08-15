const { MongoClient } = require("mongodb");
const connectionString = process.env.ATLAS_URI;
const client = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect(async function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = await db.db("ShinyRP");
      console.log("Successfully connected to MongoDB.");

      return callback(undefined, dbConnection);
    });
  },

  getDb: function () {
    return dbConnection;
  },
};
