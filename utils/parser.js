const fields_verification = async (fields, jsonObject) =>
  new Promise(async (res, rej) => {
    await fields.map((e) => {
      if (!jsonObject[e]) {
        rej(`${e} missing!`);
        return;
      }
    });
    res();
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
module.exports = { fields_verification, generate_condition };
