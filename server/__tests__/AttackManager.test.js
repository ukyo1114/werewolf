const AttackManager = require("../classes/AttackManager");

const mockErrors = {
  INVALID_ATTACK: "襲撃先が無効です",
};

const mockPlayers = {
  players: new Map([
    ["villager", { _id: "villager", role: "villager", status: "alive" }],
    ["seer", { _id: "seer", role: "seer", status: "alive" }],
    ["medium", { _id: "medium", role: "medium", status: "alive" }],
    ["hunter", { _id: "hunter", role: "hunter", status: "alive" }],
    ["werewolf1", { _id: "werewolf1", role: "werewolf", status: "alive" }],
    ["werewolf2", { _id: "werewolf2", role: "werewolf", status: "alive" }],
    ["madman", { _id: "madman", role: "madman", status: "alive" }],
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

test("receiveAttackTarget sets attack target for the current day", () => {
  const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);

  attackManager.receiveAttackTarget("werewolf1", "villager");

  const history = attackManager.attackHistory.get(mockPhase.currentDay);
  expect(history).toEqual({ playerId: "villager" });
});

test("receiveAttackTarget throws error for invalid attack", () => {
  const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);

  expect(() => { // werewolfを襲撃
    attackManager.receiveAttackTarget("werewolf1", "werewolf2");
  }).toThrow(mockErrors.INVALID_ATTACK);

  expect(() => { // villagerが襲撃
    attackManager.receiveAttackTarget("villager", "seer");
  }).toThrow(mockErrors.INVALID_ATTACK);
});

test("attack kills target if not guarded", () => {
  const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
  attackManager.receiveAttackTarget("werewolf1", "villager");

  const result = attackManager.attack();

  expect(result._id).toBe("villager");
  expect(mockPlayers.players.get("villager").status).toBe("dead");
});

test("attack does not kill target if guarded", () => {
  const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
  attackManager.receiveAttackTarget("werewolf1", "seer");

  const result = attackManager.attack();

  expect(result).toBeNull();;
  expect(mockPlayers.players.get("seer").status).toBe("alive");
});

test("getRandomAttackTarget selects a random non-werewolf target", () => {
  const attackManager = new AttackManager(mockPlayers, mockPhase, mockGuard);
  attackManager.receiveAttackTarget("werewolf1", "seer");

  const targetId = attackManager.getRandomAttackTarget();
  const target = mockPlayers.players.get(targetId);

  expect(target.role).not.toBe("werewolf");
  expect(target.status).toBe("alive")
});