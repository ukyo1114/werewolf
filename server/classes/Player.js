class Player {
  constructor(userId) {
    this._id = userId;
    this.status = "alive";
    this.role = null;
  }

  assignRole(role) {
    this.role = role;
  }

  kill() {
    this.status = "dead";
  }
}

module.exports = Player;