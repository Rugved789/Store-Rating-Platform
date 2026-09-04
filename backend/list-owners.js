const DirectSQLClient = require('./src/models/prismaClientDirect');

(async () => {
  try {
    const sql = 'SELECT id, name, email, role FROM "User" WHERE role = \'STORE_OWNER\'';
    const result = await DirectSQLClient.query(sql, []);
    
    console.log('\n=== Store Owners ===\n');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Name: ${row.name}`);
      console.log(`Email: ${row.email}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
