const messages = {
  VOTE_COMPLETED: "投票が完了しました",
  FORTUNE_COMPLETED: "占い先の指定が完了しました",
  GUARD_COMPLETED: "護衛先の指定が完了しました",
  ATTACK_COMPLETED: "襲撃先の指定が完了しました",
  LEFT_CHANNEL: "チャンネルから退出しました",
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
  FORTUNE_RESULT_NOT_FOUND: "占い結果が取得できません",
  MEDIUM_RESULT_NOT_FOUND: "霊能結果が取得できません",

  GUARD_HISTORY_NOT_FOUND: "護衛履歴が取得できません",
  ATTACK_HISTORY_NOT_FOUND: "襲撃履歴が取得できません",
  GAME_IS_PROCESSING: "集計中のため受付できません",
  GAME_CREATION_FAILED: "ゲームの開始中にエラーが発生しました",
  EMAIL_ALREADY_REGISTERED: "メールアドレスが既に登録されています",

  USER_CREATION_FAILED: "ユーザーの作成中にエラーが発生しました",
  INVALID_EMAIL_OR_PASSWORD: "メールアドレスもしくはパスワードが間違っています",
  INVALID_PASSWORD: "パスワードが間違っています",
  PROFILE_UPDATE_NOT_ALLOWED_DURING_GAME: "ゲーム中のためプロフィールの更新ができません",
  PASSWORD_MISSING: "現在のパスワードが入力されていません",

  INVALID_EMAIL: "メールアドレスが無効です",
  CHANNEL_NOT_FOUND: "チャンネルが見つかりません",
  PERMISSION_DENIED: "権限がありません",
  USER_BLOCKED: "チャンネルへのアクセスがブロックされています",
  CHANNEL_ID_MISSING: "チャンネルIDが提供されていません",

  SELF_BLOCK: "自分をブロックすることはできません",
  USER_ALREADY_BLOCKED: "選択されたユーザーは既にブロックされています",
  USER_NOT_BLOCKED: "選択されたユーザーはブロックされていません",
  MESSAGE_NOT_FOUND: "メッセージが見つかりません",
  MESSAGE_ID_MISSING: "メッセージIDが提供されていません",

  MESSAGE_SENDING_FORBIDDEN: "メッセージの送信が禁止されています",
  CHANNEL_ACCESS_FORBIDDEN: "チャンネルを利用できません",
  IMAGE_MISSING: "画像が提供されていません",
  EMAIL_NOT_REGISTERED: "メールアドレスが登録されていません",
  CHANNEL_CREATION_FAILED: "チャンネルの作成中にエラーが発生しました",
};

const gameMaster = {
  PREPARATION: "村の中に人狼が紛れ込んでしまいましたわ。きゃー。みなさんでぎゃふんと言わせちゃいましょうね。",
  MORNING: "ふわぁー。おはようございますわ。今日も一日はりきっていきましょうね。",
  NIGHT: "わおーん。しずかな夜に狼の遠吠えが響いていますわね。ではおやすみなさいませ。",
  EXECUTION: (player) => `投票の結果、【${player}】さんが処刑されましたわ。これでよかったのかしら。しくしく。`,
  ATTACK: (player) => player ? `もぐもぐ。【${player}】さんが昨夜襲撃されましたわ。` : "あら、昨夜は誰も犠牲にならなかったようですわ。ラッキーでしたわね。",
  VILLAGERS_WIN: "村に平和が戻りました。めでたしめでたし。村人チームの勝利ですわ。",
  WEREWOLVES_WIN: "人狼は村をほろぼすと、次の標的を求めて去っていきました。ぱちぱち。人狼チームの勝利ですわ。",
  VILLAGE_ABANDONED: "投票者がいなかった為、この村は廃村になってしまいました。また遊んでくださいね。",
  TIME_REDUCTION: "時短", // 時短実装後に変更
}

module.exports = { messages, errors, gameMaster };