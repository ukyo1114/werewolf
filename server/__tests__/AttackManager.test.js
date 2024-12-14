const AttackManager = require("../classes/AttackManager");

const mockErrors = {
  INVALID_ATTACK: "襲撃先が無効です",
};

const mockPlayers = {
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
  getFilteredPlayers: jest.fn((filterFn) =>
    Array.from(mockPlayers.players.values()).filter(filterFn)
  ),
  kill: jest.fn((id) => {
    const player = mockPlayers.players.get(id);
    if (player) player.status = "dead";
  }),
};

const mockPhase = {
  currentDay: 1,
  currentPhase: "night",
};

const mockGuard = {
  guard: jest.fn((id) => (id === "seer")),
};

describe("receiveAttackTarget", () => {
  test("receiveAttackTarget sets attack target for the current day", () => {
    const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);

    attackManager.receiveAttackTarget("werewolf1", "villager1");

    const history = attackManager.attackHistory.get(mockPhase.currentDay);
    expect(history).toEqual({ playerId: "villager1" });
  });

  test("receiveAttackTarget throws error for invalid attack", () => {
    const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);

    expect(() => { // role = werewolfを襲撃
      attackManager.receiveAttackTarget("werewolf1", "werewolf2");
    }).toThrow(mockErrors.INVALID_ATTACK);

    expect(() => { // role = villagerが襲撃
      attackManager.receiveAttackTarget("villager1", "seer");
    }).toThrow(mockErrors.INVALID_ATTACK);
    
    expect(() => { // 死亡したプレイヤーが襲撃
      attackManager.receiveAttackTarget("werewolf2", "villager1");
    }).toThrow(mockErrors.INVALID_ATTACK);

    expect(() => { // 死亡したプレイヤーを襲撃
      attackManager.receiveAttackTarget("werewolf1", "villager2");
    }).toThrow(mockErrors.INVALID_ATTACK);
  });

  test("receiveAttackTarget does not allow attacks outside of 'night' phase", () => {
    const originalPhase = mockPhase.currentPhase;
    mockPhase.currentPhase = "day";

    const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);

    expect(() => { // 昼に襲撃
      attackManager.receiveAttackTarget("werewolf1", "villager1");
    }).toThrow(mockErrors.INVALID_ATTACK);

    mockPhase.currentPhase = originalPhase;
  });
});

describe("attack", () => {
  test("attack kills target if not guarded", () => {
    const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
    attackManager.receiveAttackTarget("werewolf1", "villager1");

    const result = attackManager.attack();

    expect(result.attackedPlayer).toBe("villager1");
    expect(mockPlayers.players.get("villager1").status).toBe("dead");
  });

  test("attack does not kill target if guarded", () => {
    const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
    attackManager.receiveAttackTarget("werewolf1", "seer");

    const result = attackManager.attack();

    expect(result.attackedPlayer).toBeNull();;
    expect(mockPlayers.players.get("seer").status).toBe("alive");
  });

  test("getRandomAttackTarget selects a random non-werewolf target", () => {
    const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
    const spy = jest.spyOn(attackManager, "getRandomAttackTarget");

    const result = attackManager.attack();

    expect(result).toHaveProperty("attackedPlayer");
    expect(spy).toHaveBeenCalled();
  });
});

test("getRandomAttackTarget selects a random non-werewolf target", () => {
  const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
  attackManager.receiveAttackTarget("werewolf1", "seer");

  const targetId = attackManager.getRandomAttackTarget();
  const target = mockPlayers.players.get(targetId);

  expect(target.role).not.toBe("werewolf");
  expect(target.status).toBe("alive")
});
