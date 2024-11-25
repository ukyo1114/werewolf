import * as Yup from "yup";

export const signupValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "ユーザー名は2文字以上である必要があります")
    .max(12, "ユーザー名は12文字以内である必要があります")
    .required("ユーザー名は必須です"),

  email: Yup.string()
    .trim()
    .email("有効なメールアドレスを入力してください")
    .required("メールアドレスは必須です"),

  password: Yup.string()
    .trim()
    .min(8, "パスワードは8文字以上である必要があります")
    .max(20, "パスワードは20文字以内である必要があります")
    .required("パスワードは必須です"),

  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref("password"), null], "パスワードが一致しません")
    .required("確認用パスワードは必須です"),
});

export const signupInitialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("有効なメールアドレスを入力してください")
    .required("メールアドレスは必須です"),
  
  password: Yup.string()
    .trim()
    .min(8, "パスワードは8文字以上である必要があります")
    .max(20, "パスワードは20文字以内である必要があります")
    .required("パスワードは必須です"),
});

export const reqPasswordResetSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("有効なメールアドレスを入力してください")
    .required("メールアドレスは必須です"),
});