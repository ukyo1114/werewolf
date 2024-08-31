const games = {};

class GameState {
  constructor (game) {
    this.channelId = game.channel;
    this.gameId = game._id;
    this.gameNameSpace = null;
    this.players = game.users.map((player) => {
      return {
        ...player,
        status: "alive"
      };
    });
    this.votes = new Map();
    this.fortuneTarget = new Map();
    this.attackTarget = new Map();
    this.guardTarget = new Map();
    this.mediumTarget = new Map();
    this.phase = {
      currentDay: 0,
      currentPhase: "pre",
      changedAt: new Date(game.createdAt)
    }
    this.result = "running";
    this.role();
  }

  role() {
    const roles = [
      "villager", "villager", "villager", "villager", "seer", "medium", "hunter",
      "werewolf", "werewolf", "madman"
    ];
    const shuffledRoles = this.shuffle(roles);
    this.players.forEach((player, index) => {
      player.role = shuffledRoles[index];
    });
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static createGame(game) {
    const gameId = game._id;
    games[gameId] = new GameState(game);
  }

  startTimer() {
    const currentPhase = this.phase.currentPhase;
    let timer;
    if (currentPhase === "pre") {
      timer = 30;
    } else if (currentPhase === "day") {
      timer = 10 * 60;
    } else if (currentPhase === "night") {
      timer = 3 * 60;
    }
    setTimeout(() => {
      // ユーザーへの通知を追加
      this.switchPhase();
    }, timer * 1000);
  }

  switchPhase() {
    const currentDay = this.phase.currentDay;
    if (this.phase.currentPhase === "day") {
      if (this.votes.has(currentDay)) {
        this.execution();
      } else {
        this.result = "villageAbandoned"; // 廃村
      }
      this.judgement();
    } else if (this.phase.currentPhase === "night") {
      this.attack(currentDay);
      this.fortune(currentDay);
      this.judgement();
    }
    this.nextPhase();
    this.updateGameState();
    if (this.result === "running") {
      this.startTimer();
    }
  }

  nextPhase() {
    const currentDay = this.phase.currentDay;
    if (this.result === "running") {
      const isNightOrPre = this.phase.currentPhase === "pre" || this.phase.currentPhase === "night";
      this.phase =  {
        currentDay: isNightOrPre ? currentDay + 1 : currentDay,
        currentPhase: isNightOrPre ? "day" : "night",
        changedAt: new Date()
      };
    } else {
      this.phase =  {
        currentDay: currentDay,
        currentPhase: "end",
        changedAt: new Date()
      };
    }
  }

  judgement() {
    let village = 0;
    let werewolf = 0;
    this.players.forEach((player) => {
      if (player.status === "alive") {
        player.role !== "werewolf" ? village++ : werewolf++;
      }
    });
    if (werewolf === 0) {
      this.result = "villagersWin";
    } else if (werewolf >= village) {
      this.result = "werewolvesWin";
    }
  }

  receiveVote(vote) {
    const currentDay = this.phase.currentDay;
    if (!this.votes.has(currentDay)) {
      this.votes.set(currentDay, new Map());
    }
    const { voter, votee } = vote;  
    this.votes.get(currentDay).set(voter, votee);
  }

  voteCounter() {
    const voteCount = new Map();
    const currentDay = this.phase.currentDay;
    this.votes.get(currentDay).forEach((votee) => {
      if (!voteCount.has(votee)) {
        voteCount.set(votee, 0);
      }
      voteCount.set(votee, voteCount.get(votee) + 1);
    })
    return voteCount;
  }

  execution() {
    const voteCount = this.voteCounter();
    let target = [];
    let maxVotes = 0;
    voteCount.forEach((count, votee) => {
      if (count > maxVotes) {
        target = [votee];
        maxVotes = count;
      } else if (count === maxVotes) {
        target.push(votee);
      }
    })
    const index = Math.floor(Math.random() * target.length);
    const executionTarget = this.players.find(player => player._id === target[index]);
    if (executionTarget) {
      executionTarget.status = "dead";
      this.medium(executionTarget);
    }
  }

  medium(target) {
    const medium = this.players.find(player => player.role === "medium");
    if (medium.status === "alive") {
      this.mediumTarget.set(this.phase.currentDay, {
        player: target,
        team: target.role !== "werewolf" ? "villagers" : "werewolves"
      });
    }
  }

  receiveFortuneTarget(targetId) {
    const fortuneTarget = this.players.find(player => player._id === targetId);
    this.fortuneTarget.set(this.phase.currentDay, {
      player: fortuneTarget,
      team: ""
    });
  }

  fortune(currentDay) {
    const seer = this.players.find(player => player.role === "seer");
    if (seer.status === "alive") {
      if (!this.fortuneTarget.get(currentDay)) this.randomFortuneTarget();
      const fortuneTarget = this.fortuneTarget.get(currentDay);
      fortuneTarget.team = fortuneTarget.player.role !== "werewolf" ? "villagers" : "werewolves";
    }
  }

  randomFortuneTarget() {
    const randomFortuneTargets = this.players.filter(
      player => player.status === "alive" &&
      player.role !== "seer"
    );
    const index = Math.floor(Math.random() * randomFortuneTargets.length);
    this.fortuneTarget.set(this.phase.currentDay, {
      player: randomFortuneTargets[index],
      team: ""
    });
  }

  receiveGuardTarget(targetId) {
    const guardTarget = this.players.find(player => player._id === targetId);
    this.guardTarget.set(this.phase.currentDay, {
      player: guardTarget,
    });
  }

  guard() {
    const hunter = this.players.find(player => player.role === "hunter");
    if (hunter.status === "alive") {
      const currentDay = this.phase.currentDay;
      if (!this.guardTarget.get(currentDay)) this.randomGuardTarget();
      const attackTargetId = this.attackTarget.get(currentDay).player._id;
      const guardTargetId = this.guardTarget.get(currentDay).player._id;
      return attackTargetId === guardTargetId;
    }
  }

  randomGuardTarget() {
    const randomGuardTargets = this.players.filter(
      player => player.status === "alive" &&
      player.role !== "hunter"
    );
    const index = Math.floor(Math.random() * randomGuardTargets.length);
    this.guardTarget.set(this.phase.currentDay, {
      player: randomGuardTargets[index]
    });
  }

  receiveAttackTarget(targetId) {
    const attackTarget = this.players.find(player => player._id === targetId);
    this.attackTarget.set(this.phase.currentDay, {
      player: attackTarget
    });
  }

  randomAttackTarget() {
    const randomAttackTargets = this.players.filter(
      player => player.status === "alive" &&
      player.role !== "werewolf"
    );
    const index = Math.floor(Math.random() * randomAttackTargets.length);
    this.attackTarget.set(this.phase.currentDay, {
      player: randomAttackTargets[index]
    });
  }
  // どこかに襲撃先と護衛先を通知する処理を追加する
  attack(currentDay) {
    if (!this.attackTarget.get(currentDay)) this.randomAttackTarget();
    const attackTargetId = this.attackTarget.get(currentDay).player._id;
    const result = this.guard();
    if (result) {
      console.log("護衛成功");
    } else {
      const attackTarget = this.players.find(player => player._id === attackTargetId);
      attackTarget.status = "dead";
    }
  }

  updateGameState() {
    const gameId = this.gameId;
    try {
      const gameState = this.getGameState();
      this.gameNameSpace.in(gameId).emit("update game state", gameState);
    } catch(error) {
      console.error(`Failed to update game state for game ${gameId}:`, error.message);
    }
  }

  getGameState() {
    const users = this.players.map(({ role, ...rest }) => rest);
    return {
      users: users,
      phase: this.phase
    }
  }

  targetList(userId) {
    const targetList = this.players.filter(
      player => player.status === "alive" &&
      player._id !== userId
    );
    return targetList;
  }

  attackTargetList() {
    const targetList = this.players.filter(
      player => player.status === "alive" &&
      player.role !== "werewolf"
    );
    return targetList;
  }
}

module.exports = { games, GameState };