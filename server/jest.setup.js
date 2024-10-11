// jest.setup.js
const { clearDatabase, closeDatabase, openDatabase } = require('./testUtils');

beforeAll(async () => {
  await openDatabase(); // 必要に応じて
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
