const request = require("supertest");
const path = require("path");
const fs = require("fs");

const server = require("../app");
const User = require("../models/userModel");
const { genVerificationToken } = require("../utils/generateToken");
const { sendMail } = require("../utils/sendMail");
const { getUserById, uploadPicture } = require("../utils/userUtils");

jest.mock("../utils/connectDB", () => jest.fn());
jest.mock("../models/userModel", () => ({
  exists: jest.fn(),
  create: jest.fn(),
}));
jest.mock("../utils/generateToken", () => ({
  genVerificationToken: jest.fn(),
}));
jest.mock("../utils/sendMail", () => ({
  sendMail: jest.fn(),
}));
jest.mock("../utils/userUtils", () => ({
  getUserById: jest.fn(),
  uploadPicture: jest.fn(),
}));

afterAll(() => {
  server.close();
  jest.clearAllMocks();
});

test("未定義のルートでindex.htmlを返す", async () => {
  // ビルドファイルの存在確認
  const indexPath = path.join(__dirname, "../public/build/index.html");
  expect(fs.existsSync(indexPath)).toBe(true);

  const response = await request(server).get("/non-existent-route");
  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toMatch(/html/);
  expect(response.text).toContain("<!doctype html>");
});

describe("/api/user/signup", () => {
  test("ユーザーを登録する", async () => {
    const mockUser = { _id: "12345", name: "Test User", email: "test@example.com" };
    const mockToken = "verification-token";

    User.exists.mockResolvedValue(false);
    User.create.mockResolvedValue({ ...mockUser, save: jest.fn() });
    genVerificationToken.mockReturnValue(mockToken);
    sendMail.mockResolvedValue();
    uploadPicture.mockResolvedValue("path/to/picture.jpg");
    getUserById.mockResolvedValue({ ...mockUser, pic: null, save: jest.fn() });

    const response = await request(server)
      .post("/api/user/signup")
      .send({ name: "Test User", email: "test@example.com", password: "12345678", pic: "mock-pic-data" });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token", mockToken);

    expect(User.exists).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(User.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      password: "12345678",
      pic: null,
      verificationToken: mockToken,
    });
    expect(sendMail).toHaveBeenCalledWith("test@example.com", mockToken);
    expect(uploadPicture).toHaveBeenCalledWith("12345", "mock-pic-data");
    expect(getUserById).toHaveBeenCalledWith("12345", false);
  });
});