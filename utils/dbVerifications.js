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

module.exports = { is_id_linked };
