const request = require("supertest");
const express = require("express");

const {
  getChannelList,
  createChannel,
} = require("../controllers/channelControllers");

jest.mock("../models/channelModel", () => ({
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock("../utils/channelUtils", () => ({
  isUserAdmin: jest.fn(),
  getChannelById: jest.fn(),
}));

const Channel = require("../models/channelModel");

describe("Channel Controllers", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.use((req, res, next) => {
      req.userId = req.headers["userid"];
      next();
    });

    app.get("/list", getChannelList);
    app.post("/create", createChannel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getChannelList", () => {
    it("チャンネルリストを返す", async () => {
      Channel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValueOnce([{
          channelName: "Test Channel",
          description: "A channel for testing",
          users: [],
          channelAdmin: "adminUser",
          hasPassword: true,
          blockUsers: [],
        }]),
      });

      const res = await request(app)
        .get("/list");
      
      expect(res).toMatchObject({
        status: 200,
        body: {
          channelList: [{
            channelName: "Test Channel",
            description: "A channel for testing",
            users: [],
            channelAdmin: "adminUser",
            hasPassword: true,
            blockUsers: [],
          }],
        },
      });
    });

    it("チャンネルが存在しない場合、404エラーを返す", async () => {
      Channel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValueOnce([]),
      });

      await request(app)
        .get("/list")
        .expect(404);
    });
  });

  describe("createChannel", () => {
    it("チャンネルの作成", async () => {
      Channel.create.mockResolvedValueOnce ({
        _id: "testChannelId",
      });

      Channel.findById.mockReturnValueOnce ({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValueOnce({
          _id: "testChannelId",
          channelName: "Test Channel",
          description: "A channel for testing",
          users: [],
          channelAdmin: "adminUser",
          blockUsers: [],
        }),
      });

      const res = await request(app)
        .post("/create")
        .send({
          channelName: "Test Channel",
          description: "A channel for testing",
          password: null,
        })
        .set("userId", "adminUser");
      
      expect(res).toMatchObject({
        status: 201,
        body: {
          channel: {
            _id: "testChannelId",
            channelName: "Test Channel",
            description: "A channel for testing",
            users: [],
            channelAdmin: "adminUser",
            blockUsers: [],
          }
        },
      });
    });
  });
});

