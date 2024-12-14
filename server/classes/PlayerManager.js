const _ = require("lodash");

const { userGroups } = require("../controllers/messageControllers");
 
class PlayerManager {
  static roles = [
    "villager",
    "villager",
    "villager",
    "villager",
    "seer",
    "medium",
    "hunter",
    "werewolf",
    "werewolf",
    "madman",
  ];

  constructor(gameId, users) {
    this.gameId = gameId;
    this.setPlayers(users);
    this.assignRoles(PlayerManager.roles);
  }

  setPlayers(users) {
    this.players = new Map();
    users.forEach((user) => {
      this.players.set(user._id.toString(), {
        _id: user._id.toString(),
        name: user.name,
        status: "alive",
        role: null,
      });
    });
  }

  assignRoles(roles) {
    const shuffledRoles = _.shuffle(roles);

    this.players.forEach((pl) => {
      const role = shuffledRoles.shift() || null;
      if (role) pl.role = role;
    });
  }

  kill(playerId) {
    const player = this.players.get(playerId);

    if (player) {
      userGroups[this.gameId].users.get(playerId)?.eventEmitter.emit("kill");
      player.status = "dead";
    }
  }

  getPlayerState(playerId) {
    const player = this.players.get(playerId);
    if (!player) return { _id: playerId, status: "spectator", role: "" };
    
    if (player.role !== "werewolf") return player;
    
    player.partnerId = this.getWerewolfPartner(playerId);
    return player;
  }

  getPlayerById(playerId) {
    return Array.from(this.players.values()).find((pl) => pl._id === playerId);
  }

  getWerewolfPartner(playerId) {
    for (let pl of this.players.values()) {
      if (pl.role === "werewolf" && pl._id !== playerId) {
        return pl._id;
      }
    }
    return null;
  }

  getFilteredPlayers(predicate) {
    return Array.from(this.players.values()).filter(predicate);
  }

  findPlayerByRole(role) {
    return Array.from(this.players.values()).find((pl) => pl.role === role);
  }

  getLivingPlayers() {
    return Array.from(this.players.values()).filter((pl) => 
      pl.status === "alive"
    );
  }

  getPlayersWithoutRole() {
    return Array.from(this.players.values()).map(({ role, ...rest }) => rest);
  }

  // chatNameSpace
  getWerewolves() {
    return Array.from(this.players.values())
      .filter((pl) => pl.role === "werewolf")
      .map((pl) => pl._id);
  }
}

module.exports = PlayerManager;