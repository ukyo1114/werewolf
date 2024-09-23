const EventEmitter = require("events");
const gameEvents = new EventEmitter();
const games = {};

class GameState {
  constructor(game) {
    this.channelId = game.channel.toString();
    this.gameId = game._id.toString();
    this.players = game.users.map((player) => {
      return {
        _id: player._id.toString(),
        status: "alive",
        role: "",
      };
    });
    // 別クラスで管理
    this.votes = new Map();            // 分割
    this.fortuneTarget = new Map();
    this.attackTarget = new Map();
    this.guardTarget = new Map();
    this.mediumTarget = new Map(); // 分割
    // 別クラスに分割
    this.phases = {
      currentDay: 0,
      currentPhase: "pre",
      changedAt: new Date(game.createdAt),
    };
    this.result = "running";
    this.role(); // 別クラスに分割
  }

  // 別クラスに分割
  role() {
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
    const shuffledRoles = this.shuffle(roles);

    this.players.forEach((player, index) => {
      player.role = shuffledRoles[index];
    });
  }

  // 別クラスに分割
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
    games[gameId].startTimer();
  }

  // 分割
  startTimer() {
    const currentPhase = this.phases.currentPhase;
    let timer;

    if (currentPhase === "pre") {
      timer = 30;
    } else if (currentPhase === "day") {
      timer = 10 * 60;
    } else if (currentPhase === "night") {
      timer = 3 * 60;
    }

    setTimeout(() => {
      this.switchPhase();
    }, timer * 1000);
  }

  // 分割
  switchPhase() {
    const currentDay = this.phases.currentDay;

    if (this.phases.currentPhase === "day") {
      if (this.votes.has(currentDay)) {
        this.execution();
      } else {
        this.result = "villageAbandoned";
      }
      this.judgement();
    } else if (this.phases.currentPhase === "night") {
      this.fortune(currentDay);
      this.attack(currentDay);
      this.judgement();
    }

    this.nextPhase();
    this.updateGameState();

    if (this.result === "running") {
      this.startTimer();
    } else {
      // 通知の処理を追加
    }
  }

  // 分割
  nextPhase() {
    const currentDay = this.phases.currentDay;

    if (this.result === "running") {
      const isNightOrPre =
        this.phases.currentPhase === "pre" ||
        this.phases.currentPhase === "night";
      this.phases = {
        currentDay: isNightOrPre ? currentDay + 1 : currentDay,
        currentPhase: isNightOrPre ? "day" : "night",
        changedAt: new Date(),
      };
    } else {
      this.phases = {
        currentDay: currentDay,
        currentPhase: "end",
        changedAt: new Date(),
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

  // 分割
/*   receiveVote(vote) {
    const currentDay = this.phases.currentDay;

    if (!this.votes.has(currentDay)) {
      this.votes.set(currentDay, new Map());
    }

    const { voter, votee } = vote;
    const player = this.players.find((pl) => pl._id === voter);

    if (this.phases.currentPhase === "day" && player?.status === "alive") {
      this.votes.get(currentDay).set(voter, votee);
    } else {
      throw new Error("投票できなかったようです。");
    }
  } */

  // 分割
/*   voteCounter() {
    const voteCount = new Map();
    const currentDay = this.phases.currentDay;

    this.votes.get(currentDay).forEach((votee) => {
      if (!voteCount.has(votee)) {
        voteCount.set(votee, 0);
      }
      voteCount.set(votee, voteCount.get(votee) + 1);
    });
    return voteCount;
  } */

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
    });

    const index = Math.floor(Math.random() * target.length);
    const executionTarget = this.players.find(
      (player) => player._id === target[index],
    );

    if (executionTarget) {
      executionTarget.status = "dead";
      this.medium(executionTarget._id);
    }
  }
/* 
  medium(targetId) {
    const medium = this.players.find((player) => player.role === "medium");

    if (medium.status === "alive") {
      const mediumTarget = this.players.find((pl) => pl._id === targetId);
      const currentDay = this.phases.currentDay;

      this.mediumTarget.set(currentDay, {
        playerId: targetId,
        team: mediumTarget?.role !== "werewolf" ? "villagers" : "werewolves",
      });
    }
  } */

  receiveFortuneTarget(userId, targetId) {
    const player = this.players.find((pl) => pl._id === userId);

    if (
      this.phases.currentPhase === "night" &&
      player?.status === "alive" &&
      player?.role === "seer"
    ) {
      const fortuneTarget = this.players.find((pl) => pl._id === targetId);

      if (fortuneTarget?.status === "alive" && fortuneTarget.role !== "seer") {
        const currentDay = this.phases.currentDay;

        this.fortuneTarget.set(currentDay, {
          playerId: targetId,
          team: "unknown",
        });
      } else {
        throw new Error("占い先の受信に失敗したようです。");
      }
    } else {
      throw new Error("占い先の受信に失敗したようです。");
    }
  }

  fortune(currentDay) {
    const seer = this.players.find((player) => player.role === "seer");

    if (seer?.status === "alive") {
      if (!this.fortuneTarget.get(currentDay))
        this.randomFortuneTarget(currentDay);
      const fortuneTarget = this.fortuneTarget.get(currentDay);
      const targetPl = this.players.find(
        (pl) => pl._id === fortuneTarget.playerId,
      );
      fortuneTarget.team =
        targetPl.role !== "werewolf" ? "villagers" : "werewolves";
    }
  }

  randomFortuneTarget(currentDay) {
    const randomFortuneTargets = this.players.filter(
      (player) => player.status === "alive" && player.role !== "seer",
    );

    if (randomFortuneTargets.length > 0) {
      const index = Math.floor(Math.random() * randomFortuneTargets.length);
      const randomFortuneTargetId = randomFortuneTargets[index]._id;
      this.fortuneTarget.set(currentDay, {
        playerId: randomFortuneTargetId,
        team: "unknown",
      });
    } else {
      console.log("占う対象がいないようです。");
    }
  }

  receiveGuardTarget(userId, targetId) {
    const player = this.players.find((pl) => pl._id === userId);

    if (
      this.phases.currentPhase === "night" &&
      player?.status === "alive" &&
      player?.role === "hunter"
    ) {
      const guardTarget = this.players.find((pl) => pl._id === targetId);

      if (guardTarget?.status === "alive" && guardTarget.role !== "hunter") {
        const currentDay = this.phases.currentDay;
        this.guardTarget.set(currentDay, {
          playerId: targetId,
        });
      } else {
        throw new Error("護衛先の受信に失敗したようです。");
      }
    } else {
      throw new Error("護衛先の受信に失敗したようです。");
    }
  }

  guard(currentDay) {
    const hunter = this.players.find((player) => player.role === "hunter");

    if (hunter.status === "alive") {
      if (!this.guardTarget.get(currentDay)) this.randomGuardTarget(currentDay);
      const attackTargetId = this.attackTarget.get(currentDay).playerId;
      const guardTargetId = this.guardTarget.get(currentDay).playerId;
      return attackTargetId === guardTargetId;
    }
  }

  randomGuardTarget(currentDay) {
    const randomGuardTargets = this.players.filter(
      (player) => player.status === "alive" && player.role !== "hunter",
    );

    if (randomGuardTargets.length > 0) {
      const index = Math.floor(Math.random() * randomGuardTargets.length);
      const randomGuardTargetId = randomGuardTargets[index]._id;
      this.guardTarget.set(currentDay, {
        playerId: randomGuardTargetId,
      });
    } else {
      console.log("護衛対象がいないようです。");
    }
  }

  receiveAttackTarget(userId, targetId) {
    const player = this.players.find((pl) => pl._id === userId);

    if (
      this.phases.currentPhase === "night" &&
      player?.status === "alive" &&
      player?.role === "werewolf"
    ) {
      const attackTarget = this.players.find((pl) => pl._id === targetId);

      if (
        attackTarget?.status === "alive" &&
        attackTarget.role !== "werewolf"
      ) {
        const currentDay = this.phases.currentDay;
        this.attackTarget.set(currentDay, {
          playerId: targetId,
        });
      } else {
        throw new Error("襲撃先の受信に失敗したようです。");
      }
    } else {
      throw new Error("襲撃先の受信に失敗したようです。");
    }
  }

  randomAttackTarget(currentDay) {
    const randomAttackTargets = this.players.filter(
      (player) => player.status === "alive" && player.role !== "werewolf",
    );

    if (randomAttackTargets.length > 0) {
      const index = Math.floor(Math.random() * randomAttackTargets.length);
      const randomAttackTargetId = randomAttackTargets[index]._id;
      this.attackTarget.set(currentDay, {
        playerId: randomAttackTargetId,
      });
    } else {
      console.error("襲撃対象がいないようです。"); // 変更
    }
  }

  attack(currentDay) {
    if (!this.attackTarget.get(currentDay)) this.randomAttackTarget(currentDay);
    const result = this.guard(currentDay);

    if (result) {
      console.log("護衛成功"); // 護衛成功時の処理を追加
    } else {
      const attackTargetId = this.attackTarget.get(currentDay).playerId;
      const attackTarget = this.players.find(
        (player) => player._id === attackTargetId,
      );
      attackTarget.status = "dead";
    }
  }

  updateGameState() {
    const gameState = this.getGameState();
    gameEvents.emit("update game state", gameState);
  }

  getGameState() {
    const users = this.players.map(({ role, ...rest }) => rest);
    return {
      gameId: this.gameId,
      users: users,
      phases: this.phases,
    };
  }

  getUserState(userId) {
    const userState = this.players.find((player) => player._id === userId);

    if (userState.role === "werewolf") {
      const partner = this.players.find(
        (pl) => pl._id !== userId && pl.role === "werewolf",
      );
      userState.partnerId = partner._id;
    }
    return userState;
  }
/* 
  getVoteHistory(userId) {
    const currentPhase = this.phases.currentPhase;
    const player = this.players.find((pl) => pl._id === userId);

    if (currentPhase !== "pre" && player) {
      // ネストが深すぎ
      const voteHistory = {};
      const currentDay = this.phases.currentDay;

      this.votes.forEach((value, day) => {
        if (day !== currentDay || currentPhase !== "day") {
          if (!voteHistory[day]) voteHistory[day] = {};
          value.forEach((votee, voter) => {
            if (!voteHistory[day][votee]) voteHistory[day][votee] = [];
            voteHistory[day][votee].push(voter);
          });
        }
      });
      return voteHistory;
    } else {
      throw new Error("投票履歴の取得に失敗したようです。");
    }
  } */

  getFortuneResult(userId) {
    const currentPhase = this.phases.currentPhase;
    const player = this.players.find((pl) => pl._id === userId);

    if (currentPhase !== "pre" && player?.role === "seer") {
      const currentDay = this.phases.currentDay;
      const fortuneResult = {};

      this.fortuneTarget.forEach((value, day) => {
        if (day !== currentDay || currentPhase !== "night") {
          fortuneResult[day] = {
            playerId: value.playerId,
            team: value.team,
          };
        }
      });
      // console.log("fortuneResult:", fortuneResult);
      return fortuneResult;
    } else {
      throw new Error("占い結果の取得に失敗したようです。");
    }
  }

/*   getMediumResult(userId) {
    const currentPhase = this.phases.currentPhase;
    const player = this.players.find((pl) => pl._id === userId);

    if (currentPhase !== "pre" && player?.role === "medium") {
      const currentDay = this.phases.currentDay;
      const mediumResult = {};

      this.mediumTarget.forEach((value, day) => {
        if (day !== currentDay || currentPhase !== "night") {
          mediumResult[day] = {
            playerId: value.playerId,
            team: value.team,
          };
        }
      });
      // console.log("mediumResult:", mediumResult);
      return mediumResult;
    } else {
      throw new Error("霊能結果の取得に失敗したようです。");
    }
  } */

  getGuardHistory(userId) {
    const currentPhase = this.phases.currentPhase;
    const player = this.players.find((pl) => pl._id === userId);

    if (currentPhase !== "pre" && player?.role === "hunter") {
      const currentDay = this.phases.currentDay;
      const guardHistory = {};

      this.guardTarget.forEach((value, day) => {
        if (day !== currentDay || currentPhase !== "night") {
          guardHistory[day] = {
            playerId: value.playerId,
          };
        }
      });
      // console.log("guardHistory:", guardHistory);
      return guardHistory;
    } else {
      throw new Error("護衛履歴の取得に失敗したようです。");
    }
  }

  getAttackHistory(userId) {
    const currentPhase = this.phases.currentPhase;
    const player = this.players.find((pl) => pl._id === userId);

    if (currentPhase !== "pre" && player?.role === "werewolf") {
      const currentDay = this.phases.currentDay;
      const attackHistory = {};
      this.attackTarget.forEach((value, day) => {
        if (day !== currentDay || currentPhase !== "night") {
          attackHistory[day] = {
            playerId: value.playerId,
          };
        }
      });
      // console.log("attackHistory:", attackHistory);
      return attackHistory;
    } else {
      throw new Error("襲撃履歴の取得に失敗したようです。");
    }
  }

  static isUserInGame(userId) {
    const game = Object.values(games).find((game) => 
      game.players.some((player) => player._id === userId)
    );
    if (game && game.result === "running") {
      return true;
    }
    return false;
  }
}

module.exports = { games, GameState, gameEvents };
