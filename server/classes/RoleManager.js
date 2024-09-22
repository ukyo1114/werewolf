class RoleManager {
  constructor() {
    this.roles = [
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
  }

  assignRoles(players) {
    const shuffledRoles = this.shuffleRoles(this.roles);
    players.forEach((player, index) => {
      player.assignRole(shuffledRoles[index]);
    });
  }

  shuffleRoles(roles) {
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    return roles;
  }
}

module.exports = RoleManager;