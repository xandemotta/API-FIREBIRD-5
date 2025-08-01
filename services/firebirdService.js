// firebirdService.js
const Firebird = require('node-firebird');
const camelcase = require('camelcase');

const options = {
  host: process.env.FIREBIRD_HOST,
  port: process.env.FIREBIRD_PORT,
  database: process.env.FIREBIRD_DATABASE,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
  lowercase_keys: true,
  role: null,
  pageSize: 4096,
};

function toCamel(row) {
  const result = {};
  Object.keys(row).forEach(key => {
    result[camelcase(key)] = row[key];
  });
  return result;
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    Firebird.attach(options, (err, db) => {
      if (err) return reject(err);
      db.query(sql, params, (err, result) => {
        db.detach();
        if (err) return reject(err);

        try {
          if (Array.isArray(result)) {
            resolve(result.map(toCamel));
          } else if (result) {
            resolve([toCamel(result)]);
          } else {
            resolve([]);
          }
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}

module.exports = { query };
