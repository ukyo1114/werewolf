const messages = {
  VOTE_COMPLETED: "投票が完了しました"
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
};

module.exports = { messages, errors };