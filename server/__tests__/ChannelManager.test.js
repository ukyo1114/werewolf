const { ChannelManager } = require("../classes/ChannelManager");
const { errors } = require("../messages");

const mockChannelId = "channel1";
const mockGameId = "game1";
const mockGameInstance = {
  id: mockGameId,
  players: {
    players: new Map([
      ["villager1", { _id: "villager1", name: "villager1", role: "villager", status: "alive" }],
      ["villager2", { _id: "villager2", name: "villager2", role: "villager", status: "dead" }],
      ["seer", { _id: "seer", name: "seer", role: "seer", status: "alive" }],
      ["medium", { _id: "medium", name: "medium", role: "medium", status: "alive" }],
      ["hunter", { _id: "hunter", name: "hunter", role: "hunter", status: "alive" }],
      ["werewolf1", { _id: "werewolf1", name: "werewolf1", role: "werewolf", status: "alive" }],
      ["werewolf2", { _id: "werewolf2", name: "werewolf2", role: "werewolf", status: "dead" }],
      ["madman", { _id: "madman", name: "madman", role: "madman", status: "alive" }],
    ]),
  },
  phase: {},
};

jest.mock('../models/channelModel', () => ({
  exists: jest.fn(),
}));
jest.mock('../models/gameModel', () => ({
  exists: jest.fn(),
}));
jest.mock('../controllers/messageControllers', () => ({
  userGroups: {}, // 空のモックオブジェクトとして初期化
}));
jest.mock('../controllers/gameControllers', () => ({
  games: {}, // 空のモックオブジェクトとして初期化
}));

const Channel = require("../models/channelModel");
const Game = require("../models/gameModel");
const { userGroups } = require("../controllers/messageControllers");
const { games } = require("../controllers/gameControllers");

describe("ChannelManager", () => {
  describe("createUserGroup", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    
    test("データベースにチャンネルが登録されているとき", async () => {
      Channel.exists.mockResolvedValue(true);
      Game.exists.mockResolvedValue(false);
      
      const result = await ChannelManager.createUserGroup(mockChannelId);

      expect(Channel.exists).toHaveBeenCalledWith({ _id: mockChannelId });
      expect(Game.exists).toHaveBeenCalledWith({ _id: mockChannelId });
      expect(result).toBeInstanceOf(ChannelManager);
      expect(userGroups[mockChannelId]).toEqual(result);
    });

    test("データベースにチャンネルが登録されていてユーザーがデータベースに存在しない時", async () => {
      const mockManager = new ChannelManager("testChannel");
      Channel.exists.mockResolvedValue(false);

      await expect(mockManager.userJoined("testUser", "testSocketId"))
      .rejects.toThrow(errors.CHANNEL_ACCESS_FORBIDDEN);
    });

    test("データベースにゲームが登録されていてゲームインスタンスが存在するとき", async () => {
      Channel.exists.mockResolvedValue(false);
      Game.exists.mockResolvedValue(true);
      games[mockChannelId] = { id: mockGameId };
      
      const result = await ChannelManager.createUserGroup(mockChannelId);

      expect(Channel.exists).toHaveBeenCalledWith({ _id: mockChannelId });
      expect(Game.exists).toHaveBeenCalledWith({ _id: mockChannelId });
      expect(result).toBeInstanceOf(ChannelManager);
      expect(userGroups[mockChannelId]).toEqual(result);

      delete games[mockChannelId];
    });

    test("データベースにチャンネルもゲームも存在しない時", async () => {
      Channel.exists.mockResolvedValue(false);
      Game.exists.mockResolvedValue(false);

      await expect(ChannelManager.createUserGroup(mockChannelId))
      .rejects.toThrow(errors.CHANNEL_NOT_FOUND);
    });

    test("データベースにゲームが登録されていてゲームインスタンスが存在しないとき", async () => {
      Channel.exists.mockResolvedValue(false);
      Game.exists.mockResolvedValue(true);

      await expect(ChannelManager.createUserGroup(mockChannelId))
      .rejects.toThrow(errors.GAME_NOT_FOUND);
    });
  });

  describe("userJoined", () => {
    test("データベースにチャンネルが登録されているとき", async () => {
      const mockManager = new ChannelManager("testChannel");
      Channel.exists.mockResolvedValue(true);

      const result = await mockManager.userJoined("testUser", "testSocketId");
      expect(result).toEqual({
        userId: "testUser",
        socketId: "testSocketId",
        status: "normal",
      });
    });

    test("データベースにゲームが登録されていてユーザーがゲームに参加していない時", async () => {
      const mockManager = new ChannelManager("testChannel", mockGameInstance);
      Game.exists.mockResolvedValue(true);

      const result = await mockManager.userJoined("testUser", "testSocketId");
      expect(result).toEqual({
        userId: "testUser",
        socketId: "testSocketId",
        status: "spectator",
      });
    });

    test("データベースにゲームが登録されていてユーザーが村人（生存）", async () => {
      const mockManager = new ChannelManager("testChannel", mockGameInstance);
      Game.exists.mockResolvedValue(true);

      const result = await mockManager.userJoined("villager1", "testSocketId");
      expect(result).toEqual({
        userId: "villager1",
        socketId: "testSocketId",
        status: "normal",
      });
    });

    test("データベースにゲームが登録されていてユーザーが村人（死亡）", async () => {
      const mockManager = new ChannelManager("testChannel", mockGameInstance);
      Game.exists.mockResolvedValue(true);

      const result = await mockManager.userJoined("villager2", "testSocketId");
      expect(result).toEqual({
        userId: "villager2",
        socketId: "testSocketId",
        status: "spectator",
      });
    });

    test("データベースにゲームが登録されていてユーザーが人狼（生存）", async () => {
      const mockManager = new ChannelManager("testChannel", mockGameInstance);
      Game.exists.mockResolvedValue(true);

      const result = await mockManager.userJoined("werewolf1", "testSocketId");
      expect(result).toEqual({
        userId: "werewolf1",
        socketId: "testSocketId",
        status: "werewolf",
      });
    });

    test("データベースにゲームが登録されていてユーザーが人狼（死亡）", async () => {
      const mockManager = new ChannelManager("testChannel", mockGameInstance);
      Game.exists.mockResolvedValue(true);

      const result = await mockManager.userJoined("werewolf2", "testSocketId");
      expect(result).toEqual({
        userId: "werewolf2",
        socketId: "testSocketId",
        status: "spectator",
      });
    });

    test("データベースにゲームが登録されていてユーザーがデータベース内に存在しない時", async () => {
      const mockManager = new ChannelManager("testChannel", mockGameInstance);
      Game.exists.mockResolvedValue(false);

      await expect(mockManager.userJoined("testUser", "testSocketId"))
      .rejects.toThrow(errors.CHANNEL_ACCESS_FORBIDDEN);
    });
  });
  // グループにユーザーが参加していなくても動作することに注意

  describe("getSendMesssageType", () => {
    test("ゲームインスタンスを登録していない", () => {
      const mockManager = new ChannelManager("testChannel");
      mockManager.users.set("user1", { userId: "user1", socketId: "socket1", status: "normal" });

      const result = mockManager.getSendMessageType("user1");
      expect(result).toEqual({
        messageType: "normal"
      });
    });

    test("ゲームインスタンスを登録しておらず、ユーザーがグループに参加していない", () => {
      const mockManager = new ChannelManager("testChannel");

      expect(() => {
        mockManager.getSendMessageType("testUser");
      }).toThrow(errors.MESSAGE_SENDING_FORBIDDEN);
    });

    let manager;
  
    beforeEach(() => {
      manager = new ChannelManager("testChannel", mockGameInstance);
      manager.users.set("user1", { userId: "user1", socketId: "socket1", status: "spectator" });
      manager.users.set("user2", { userId: "user2", socketId: "socket2", status: "werewolf" });
      manager.users.set("user3", { userId: "user3", socketId: "socket3", status: "spectator" });
      manager.users.set("user4", { userId: "user4", socketId: "socket4", status: "werewolf" });
      manager.users.set("user5", { userId: "user5", socketId: "socket5", status: "spectator" });
      manager.users.set("user6", { userId: "user6", socketId: "socket6", status: "werewolf" });
      manager.users.set("user7", { userId: "user7", socketId: "socket7", status: "spectator" });
      manager.users.set("user8", { userId: "user8", socketId: "socket8", status: "werewolf" });
      manager.users.set("user9", { userId: "user9", socketId: "socket9", status: "spectator" });
      manager.users.set("user10", { userId: "user10", socketId: "socket10", status: "normal" });
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("ゲーム中（day）かつユーザーがspectator", () => {
      manager.game.phase.currentPhase = "day"
      const result = manager.getSendMessageType("user1");
      expect(result).toEqual({
        messageType: "spectator"
      });
    });

    test("ゲーム中（night）かつユーザーがspectator", () => {
      manager.game.phase.currentPhase = "night"
      const result = manager.getSendMessageType("user1");
      expect(result).toEqual({
        messageType: "spectator"
      });
    });

    test("ゲーム中（day）かつユーザーがnormal", () => {
      manager.game.phase.currentPhase = "day"
      const result = manager.getSendMessageType("user10");
      expect(result).toEqual({
        messageType: "normal"
      });
    });

    test("ゲーム中（day）かつユーザーがwerewolf", () => {
      manager.game.phase.currentPhase = "day"
      const result = manager.getSendMessageType("user2");
      expect(result).toEqual({
        messageType: "normal"
      });
    });

    test("ゲーム中（night）かつユーザーがnormal", () => {
      manager.game.phase.currentPhase = "night"

      expect(() => {
        manager.getSendMessageType("user10");
      }).toThrow(errors.MESSAGE_SENDING_FORBIDDEN);
    });

    test("ゲーム中（night）かつユーザーがwerewolf", () => {
      manager.game.phase.currentPhase = "night"
      const result = manager.getSendMessageType("user2");
      expect(result).toEqual({
        messageType: "werewolf"
      });
    });
  });

  describe("getMessageReceivers", () => {
    let manager;
  
    beforeEach(() => {
      manager = new ChannelManager("testChannel");
      manager.users.set("user1", { userId: "user1", socketId: "socket1", status: "spectator" });
      manager.users.set("user2", { userId: "user2", socketId: "socket2", status: "werewolf" });
      manager.users.set("user3", { userId: "user3", socketId: "socket3", status: "spectator" });
      manager.users.set("user4", { userId: "user4", socketId: "socket4", status: "werewolf" });
      manager.users.set("user5", { userId: "user5", socketId: "socket5", status: "spectator" });
      manager.users.set("user6", { userId: "user6", socketId: "socket6", status: "werewolf" });
      manager.users.set("user7", { userId: "user7", socketId: "socket7", status: "spectator" });
      manager.users.set("user8", { userId: "user8", socketId: "socket8", status: "werewolf" });
      manager.users.set("user9", { userId: "user9", socketId: "socket9", status: "spectator" });
      manager.users.set("user10", { userId: "user10", socketId: "socket10", status: "normal" });
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
  
    it("メッセージタイプがnormalのとき", () => {
      const result = manager.getMessageReceivers("normal");
      expect(result).toEqual({
        socketIds: null,
      });
    });
  
    it("メッセージタイプがspectatorのとき", () => {
      const result = manager.getMessageReceivers("spectator");
      expect(result).toEqual({
        socketIds: ["socket1", "socket3", "socket5", "socket7", "socket9"],
      });
    });
  
    it("メッセージタイプがwerewolfのとき", () => {
      const result = manager.getMessageReceivers("werewolf");
      expect(result).toEqual({
        socketIds: ["socket1", "socket3", "socket5", "socket7", "socket9", "socket2", "socket4", "socket6", "socket8"],
      });
    });
  });
});