class PlayerManager {
  constructor(users) {
    this.players = users.map((user) => {
      return {
        _id: user._id,
        status: "alive",
        role: null,
      };
    });
    this.assignRoles();
  }

  assignRoles() {
    const roles = [
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
    const shuffledRoles = this.shuffleRoles(roles);

    this.players.forEach((player, index) => {
      player.role = shuffledRoles[index];
    });
  }

  shuffleRoles(roles) {
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    
    return roles;
  }

  kill(playerId) {
    const player = this.players.find((pl) => pl._id === playerId);
    if (player) player.status = "dead";
  }

  getPlayerState(playerId) {
    const player = this.players.find((pl) => pl._id === playerId);

    if (!player) return null;
    if (player.role !== "werewolf") return player;

    const partner = this.players.find((pl) =>
      pl._id !== playerId && pl.role === "werewolf"
    );
    
    player.partnerId = partner._id;
    
    return player;
  }
}

module.exports = PlayerManager;