require('dotenv').config({ path: '.env.test' });

console.log('JWT_SECRET in jest.setup.js:', process.env.JWT_SECRET); // デバッグログ

const { connect, closeDatabase, clearDatabase } = require('./tests/setup');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
