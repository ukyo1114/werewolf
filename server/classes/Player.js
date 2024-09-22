class Player {
  constructor(userId) {
    this._id = userId;
    this.status = "alive";
    this.role = null;
  }

  assignRole(role) {
    this.role = role;
  }
}

module.exports = Player;