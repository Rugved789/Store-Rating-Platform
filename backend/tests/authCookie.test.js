const request = require('supertest');

jest.mock('../src/models/signupHelper', () => ({
  authenticateDirect: jest.fn(),
  createUserDirect: jest.fn(),
}));

const app = require('../src/app');
const SignupHelper = require('../src/models/signupHelper');

describe('authentication cookie behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('login sets a valid local-dev auth cookie', async () => {
    SignupHelper.authenticateDirect.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      role: 'USER',
      name: 'Test User',
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(200);

    const setCookie = response.headers['set-cookie'][0];

    expect(setCookie).toContain('token=');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).not.toContain('SameSite=None');
    expect(setCookie).not.toContain('Secure');
  });

  test('logout clears the auth cookie with matching options', async () => {
    const response = await request(app)
      .post('/auth/logout')
      .expect(200);

    const setCookie = response.headers['set-cookie'][0];

    expect(setCookie).toContain('token=;');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(setCookie).toContain('SameSite=Lax');
    expect(setCookie).not.toContain('SameSite=None');
    expect(setCookie).not.toContain('Secure');
  });
});
