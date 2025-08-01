// firebirdNativeService.js
const camelcase = require('camelcase');
const {
  createNativeClient,
  getDefaultLibraryFilename,
} = require('node-firebird-driver-native');

const client = createNativeClient(getDefaultLibraryFilename());

function toCamelObj(row, columns) {
  const obj = {};
  columns.forEach((col, idx) => {
    obj[camelcase(col)] = row[idx];
  });
  return obj;
}

async function query(sql, params = []) {
  const attachment = await client.connect({
    host: process.env.FIREBIRD_HOST,
    port: Number(process.env.FIREBIRD_PORT || 3050),
    database: process.env.FIREBIRD_DATABASE,
    user: process.env.FIREBIRD_USER,
    password: process.env.FIREBIRD_PASSWORD,
  });

  const transaction = await attachment.startTransaction();

  try {
    const statement = await attachment.prepare(transaction, sql);
    const result = await statement.executeQuery(transaction, params);
    const rows = await result.fetchAll();

    await result.close();
    await transaction.commit();

    const columns = statement.columns.map(c => c.name);
    await statement.dispose();
    await attachment.disconnect();

    return rows.map(r => toCamelObj(r, columns));
  } catch (err) {
    await transaction.rollback();
    await attachment.disconnect();
    throw err;
  }
}

module.exports = { query };
