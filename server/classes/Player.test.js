// Player.test.js

const Player = require('./Player');

describe('Player Class', () => {
  test('should create a player with correct properties', () => {
    const userId = 'user123';
    const player = new Player(userId);

    expect(player._id).toBe(userId);
    expect(player.status).toBe('alive');
    expect(player.role).toBeNull();
  });

  test('should assign a role to the player', () => {
    const player = new Player('user123');
    const role = 'seer';

    player.assignRole(role);

    expect(player.role).toBe(role);
  });
});
