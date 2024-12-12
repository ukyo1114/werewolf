const { ChannelManager } = require("../classes/ChannelManager");

describe("ChannelManager - getMessageReceivers", () => {
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