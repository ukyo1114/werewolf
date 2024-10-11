const _ = require("lodash");

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

  constructor(users) {
    this.players = new Map();
    this.setPlayers(users);
    this.assignRoles(PlayerManager.roles);
  }

  setPlayers(users) {
    users.forEach((user) => {
      this.players.set(user._id.toString(), {
        _id: user._id.toString(),
        status: "alive",
        role: null,
      });
    });
  }

  assignRoles(roles) {
    const shuffledRoles = _.shuffle(roles);

    this.players.forEach((pl) => {
      const role = shuffledRoles.shift();
      if (role) pl.role = role;
    });
  }

  kill(playerId) {
    const player = this.players.get(playerId);
    if (player) player.status = "dead";
  }

  getPlayerState(playerId) {
    const player = this.players.get(playerId);
    if (!player) return null;
    if (player.role !== "werewolf") return player;
    
    player.partnerId = this.getWerewolfPartner(playerId);
    return player;
  }

  getWerewolfPartner(playerId) {
    for (let pl of this.players.values()) {
      if (pl.role === "werewolf" && pl._id !== playerId) {
        return pl._id;
      }
    }
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
}

module.exports = PlayerManager;

// テスト済み