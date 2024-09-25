const messages = {
  VOTE_COMPLETED: "投票が完了しました",
  FORTUNE_COMPLETED: "占い先の指定が完了しました",
  GUARD_COMPLETED: "護衛先の指定が完了しました",
  ATTACK_COMPLETED: "襲撃先の指定が完了しました",
}

const errors = {
  USER_NOT_FOUND: "ユーザーが存在しません",
  INVALID_TOKEN: "認証トークンが無効です",
  TOKEN_MISSING: "認証トークンが提供されていません",
  GAME_ID_MISSING: "ゲームIDが提供されていません",
  GAME_NOT_FOUND: "ゲームが見つかりません",
  
  PLAYER_NOT_FOUND: "プレイヤーが見つかりません",
  SERVER_ERROR: "サーバー内部でエラーが発生しました",
  MISSING_DATA: "必要なデータが提供されていません",
  INVALID_VOTE: "投票が無効です",
  INVALID_FORTUNE: "占い先が無効です",

  INVALID_GUARD: "護衛先が無効です",
  INVALID_ATTACK: "襲撃先が無効です",
  VOTE_HISTORY_NOT_FOUND: "投票履歴が取得できません",
};

module.exports = { messages, errors };