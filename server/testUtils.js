// testUtils.js

const mongoose = require('mongoose');

// データベース接続用の関数（例）
const openDatabase = async () => {
  const dbUri = 'mongodb://localhost:27017/testdb'; // テスト用データベースのURI
  await mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

// データベースのクリア用の関数（例）
const clearDatabase = async () => {
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName];
    await collection.deleteMany({});
  }
};

// データベース切断用の関数（例）
const closeDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = {
  openDatabase,
  clearDatabase,
  closeDatabase,
};
