const jwt_decode = require("jwt-decode");

const fields_verification = async (fields, jsonObject) =>
  new Promise(async (res, rej) => {
    await fields.map((e) => {
      if (!jsonObject[e]) {
        console.log(jsonObject, e);
        rej(`${e} missing!`);
        return;
      }
    });
    res(1);
  });

const generate_condition = (fields, jsonObject) =>
  new Promise((res, rej) => {
    const conditions = [];
    fields.map((e) => {
      const jObject = {};
      jObject[e] = jsonObject[e];
      conditions.push(jObject);
      return;
    });
    res(conditions);
  });
const extract_fields = (fields, jsonObject) =>
  new Promise((res, rej) => {
    const newObject = {};
    fields.map((e) => {
      newObject[e] = jsonObject[e];
      return;
    });
    res(newObject);
  });

const get_user = (req) => jwt_decode(req.cookies[process.env.COOKIE_NAME]);

/*
  Verifies if the user has the shinyrp cookie returns:
    -1 : user has no cookie;
    0 : user token faild to decode;
    1 : perfectly working shinyrp cookie [USER AUTHTORIZED else USER UNAUTHTORIZED]
 */

const has_cookie = (req) => {
  const token = req?.cookies[process.env.COOKIE_NAME];
  if (!token) return -1;
  const decoded = jwt_decode(token);
  if (!decoded) return 0;
  return 1;
};
module.exports = {
  fields_verification,
  generate_condition,
  extract_fields,
  has_cookie,
  get_user,
};
