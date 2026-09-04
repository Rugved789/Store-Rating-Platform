// Test admin endpoints with proper cookie handling
const http = require('http');

function makeRequest(path, method = 'GET', data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      const setCookies = res.headers['set-cookie'] || [];

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData),
            headers: res.headers,
            setCookies: setCookies
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
            setCookies: setCookies
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function extractCookie(setCookieHeader) {
  // setCookieHeader is like: "token=abc123; Path=/; HttpOnly; Secure; SameSite=Strict"
  // We just need: "token=abc123"
  if (!setCookieHeader) return null;
  return setCookieHeader.split(';')[0];
}

async function runTests() {
  console.log('🧪 Admin Endpoints Test\n');
  console.log('═'.repeat(60));

  try {
    // Test 1: Health check
    console.log('1️⃣  Testing Health Endpoint');
    const health = await makeRequest('/health');
    console.log(`   Status: ${health.status} ✓`);

    // Test 2: Login
    console.log('\n2️⃣  Testing Login (/auth/login)');
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'admin@example.com',
      password: 'Admin@123'
    });
    
    if (loginResponse.status !== 200) {
      console.log(`   ❌ Failed: Status ${loginResponse.status}`);
      console.log(`   Response:`, loginResponse.data);
      process.exit(1);
    }

    console.log(`   Status: ${loginResponse.status} ✓`);
    console.log(`   User: ${loginResponse.data.data.user.email}`);
    console.log(`   Role: ${loginResponse.data.data.user.role}`);

    // Extract token from Set-Cookie header
    let cookies = null;
    if (loginResponse.setCookies && loginResponse.setCookies.length > 0) {
      const cookieValue = extractCookie(loginResponse.setCookies[0]);
      if (cookieValue) {
        cookies = cookieValue;
        console.log(`   Cookie: ${cookieValue.substring(0, 20)}...`);
      }
    }

    if (!cookies) {
      console.log('   ❌ No token cookie received');
      process.exit(1);
    }

    // Test 3: Admin Dashboard
    console.log('\n3️⃣  Testing Admin Dashboard (/admin/dashboard)');
    const dashboardResponse = await makeRequest('/admin/dashboard', 'GET', null, cookies);
    
    if (dashboardResponse.status === 200) {
      console.log(`   Status: ${dashboardResponse.status} ✓`);
      console.log(`   Success: ${dashboardResponse.data.success}`);
      console.log(`   Data:`, JSON.stringify(dashboardResponse.data.data, null, 2));
    } else {
      console.log(`   ❌ Status: ${dashboardResponse.status}`);
      console.log(`   Error:`, dashboardResponse.data.error);
    }

    // Test 4: Admin Stores
    console.log('\n4️⃣  Testing Admin Stores (/admin/stores)');
    const storesResponse = await makeRequest('/admin/stores', 'GET', null, cookies);
    
    if (storesResponse.status === 200) {
      console.log(`   Status: ${storesResponse.status} ✓`);
      console.log(`   Success: ${storesResponse.data.success}`);
      console.log(`   Stores Count: ${storesResponse.data.data?.length || 0}`);
      console.log(`   Total: ${storesResponse.data.total}`);
      if (storesResponse.data.data?.length > 0) {
        console.log(`   First Store: ${storesResponse.data.data[0].name}`);
      }
    } else {
      console.log(`   ❌ Status: ${storesResponse.status}`);
      console.log(`   Error:`, storesResponse.data.error);
    }

    // Test 5: Admin Users
    console.log('\n5️⃣  Testing Admin Users (/admin/users)');
    const usersResponse = await makeRequest('/admin/users', 'GET', null, cookies);
    
    if (usersResponse.status === 200) {
      console.log(`   Status: ${usersResponse.status} ✓`);
      console.log(`   Success: ${usersResponse.data.success}`);
      console.log(`   Users Count: ${usersResponse.data.data?.length || 0}`);
      console.log(`   Total: ${usersResponse.data.total}`);
      if (usersResponse.data.data?.length > 0) {
        console.log(`   First User: ${usersResponse.data.data[0].email}`);
      }
    } else {
      console.log(`   ❌ Status: ${usersResponse.status}`);
      console.log(`   Error:`, usersResponse.data.error);
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ All Tests Completed!\n');

    const allPass = [
      health.status === 200,
      loginResponse.status === 200,
      dashboardResponse.status === 200,
      storesResponse.status === 200,
      usersResponse.status === 200
    ].every(x => x);

    console.log('📊 Results:');
    console.log(`   ${health.status === 200 ? '✓' : '✗'} Health Check`);
    console.log(`   ${loginResponse.status === 200 ? '✓' : '✗'} Login`);
    console.log(`   ${dashboardResponse.status === 200 ? '✓' : '✗'} Admin Dashboard`);
    console.log(`   ${storesResponse.status === 200 ? '✓' : '✗'} Admin Stores`);
    console.log(`   ${usersResponse.status === 200 ? '✓' : '✗'} Admin Users`);
    console.log(`\n${allPass ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED'}\n`);

    process.exit(allPass ? 0 : 1);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

runTests();
