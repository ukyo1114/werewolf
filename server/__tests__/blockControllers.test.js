const request = require("supertest");
const express = require("express");

const {
  getBlockUsers, registerBlock, cancelBlock
} = require("../controllers/blockControllers");

jest.mock("../models/channelModel", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock("../utils/channelUtils", () => ({
  isUserAdmin: jest.fn(),
}));

jest.mock("../controllers/channelControllers", () => ({
  channelEvents: {
    emit: jest.fn(),
  },
}));

const Channel = require("../models/channelModel");
const { isUserAdmin } = require("../utils/channelUtils");
const { channelEvents } = require("../controllers/channelControllers");

describe("Block Controllers", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.use((req, res, next) => {
      req.userId = req.headers["userid"];
      next();
    });

    app.get("/user-list/:channelId", getBlockUsers);
    app.put("/register", registerBlock);
    app.put("/cancel", cancelBlock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getBlockUsers", () => {
    it("ブロックユーザーリストを取得", async () => {
      isUserAdmin.mockResolvedValueOnce();

      Channel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValueOnce({
          _id: "123",
          blockUsers: [{ _id: "u1", name: "User1", pic: "pic1" }],
        }),
      });

      const res = await request(app)
        .get("/user-list/123")
        .set("userId", "adminUser");
      
      expect(res).toMatchObject({
        status: 200,
        body: {
          blockUsers: [{ _id: "u1", name: "User1", pic: "pic1" }],
        },
      });
    });
  });

  describe("registerBlock", () => {
    it("ブロックユーザーを追加", async () => {
      isUserAdmin.mockResolvedValueOnce();
      Channel.updateOne.mockResolvedValueOnce({ nModified: 1 });

      const res = await request(app)
        .put("/register")
        .send({ channelId: "123", selectedUser: "targetUser" })
        .set("userId", "adminUser");

      expect(res.statusCode).toBe(200);
      expect(channelEvents.emit).toHaveBeenCalledWith("registerBlockUser", {
        channelId: "123",
        blockUser: "targetUser",
      });
    });

    it("自分自身をブロックしようとすると403エラーを返す", async () => {
      isUserAdmin.mockResolvedValueOnce();
      Channel.updateOne.mockResolvedValueOnce({ nModified: 1 });

      const res = await request(app)
        .put("/register")
        .send({ channelId: "123", selectedUser: "adminUser" })
        .set("userId", "adminUser");

      expect(res.status).toBe(403);
    });
  });

  describe("cancelBlock", () => {
    it("ブロックを解除", async () => {
      isUserAdmin.mockResolvedValueOnce();
      Channel.findByIdAndUpdate.mockResolvedValueOnce({ nModified: 1 });

      const res = await request(app)
      .put("/cancel")
      .send({ channelId: "123", selectedBUser: "targetUser" })
      .set("userId", "adminUser");

      expect(res.statusCode).toBe(200);
      expect(channelEvents.emit).toHaveBeenCalledWith("cancelBlockUser", {
        channelId: "123",
        blockUser: "targetUser",
      });
    });
  });
});