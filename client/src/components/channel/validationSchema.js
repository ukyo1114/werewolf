import * as Yup from 'yup';

export const channelValidationSchema = Yup.object({
  newMessage: Yup.string()
    .trim()
    .max(300, "メッセージは300文字以内で入力してください")
    .required("メッセージは必須です"),
});