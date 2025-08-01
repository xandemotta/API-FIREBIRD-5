const Firebird = require('node-firebird');
const camelcase = require('camelcase');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const options = {
  host: process.env.FIREBIRD_HOST,
  database: process.env.FIREBIRD_DATABASE,
  user: process.env.FIREBIRD_USER,
  password: process.env.FIREBIRD_PASSWORD,
  lowercase_keys: true,
  role: null,
  //C:\Program Files\Firebird\Firebird_4_0
  //lib: 'C:/Program Files (x86)/Firebird/Firebird_2_5/bin/fbclient.dll',
  pageSize: 4096
};
console.log('🔍 Biblioteca em uso:', options.lib);
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
