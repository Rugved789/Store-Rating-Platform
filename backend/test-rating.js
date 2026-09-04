const http = require('http');

async function test() {
  try {
    // Step 1: Login as regular user
    console.log('Starting test...');
    const token = await new Promise((resolve, reject) => {
      console.log('Attempting login...');
      const data = JSON.stringify({email: 'user1@example.com', password: 'User@123'});
      const req = http.request({hostname: 'localhost', port: 5000, path: '/auth/login', method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': data.length}}, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          console.log('1. Login:', res.statusCode);
          const cookies = res.headers['set-cookie'];
          if (cookies) {
            resolve(cookies[0].split(';')[0]);
          } else {
            reject('No token');
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    console.log('Got token, fetching stores...');

    // We need a real store ID. Let's get stores first
    const stores = await new Promise((resolve, reject) => {
      const req = http.request({hostname: 'localhost', port: 5000, path: '/auth/stores?limit=1', method: 'GET', headers: {'Cookie': token}}, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          console.log('2. Get Stores:', res.statusCode);
          try {
            const json = JSON.parse(body);
            if (json.success && json.data.stores && json.data.stores.length > 0) {
              console.log('   Stores found:', json.data.stores.length);
              resolve(json.data.stores[0].id);
            } else {
              reject('No stores found: ' + JSON.stringify(json));
            }
          } catch (e) {
            reject(e.message + ': ' + body);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log('   Using store ID:', stores.substring(0, 8) + '...');

    // Submit rating
    const result = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ rating: 4 });
      const path = '/auth/stores/' + stores + '/ratings';
      const req = http.request({hostname: 'localhost', port: 5000, path, method: 'POST', headers: {'Content-Type': 'application/json', 'Content-Length': data.length, 'Cookie': token}}, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          console.log('3. Submit Rating:', res.statusCode);
          try {
            const json = JSON.parse(body);
            console.log('   Success:', json.success);
            if (!json.success) {
              reject(json.error);
            } else {
              console.log('   Rating submitted:', json.data.rating.rating, 'stars');
              resolve(true);
            }
          } catch (e) {
            reject(e.message + ': ' + body);
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    console.log('\n✓ All tests passed!');
  } catch (err) {
    console.error('\n✗ Error:', err.message || err);
    throw err;
  }
}

test().catch(err => {
  console.error('Caught error:', err);
  process.exit(1);
}).finally(() => {
  setTimeout(() => process.exit(0), 500);
});
