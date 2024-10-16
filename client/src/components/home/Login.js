import { useState } from "react";
import {
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginValidationSchema } from "./validationSchema";

const Login = () => {
  const [pshow, setPShow] = useState(false);
  const showToast = useNotification();
  const navigate = useNavigate();

  const handleLogIn = async (values, actions) => {
    const { email, password } = values;
    actions.setSubmitting(true);

    try {
      const config = { headers: { "Content-Type": "application/json" } };

      const response = await axios.post(
        "/api/user/login",
        { email, password },
        config,
      );
      const data = response.data;
      showToast(messages.USER_LOGIN, "success");
      localStorage.setItem("userInfo", JSON.stringify(data));
      actions.setSubmitting(false);
      navigate("/chats");
    } catch (error) {
      handleError(error);
      actions.setSubmitting(false);
    }
  };

  function handleError(error) {
    const errorMessage = error?.response?.data?.error || errors.LOGIN_FAILED;
    showToast(errorMessage, "error");
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginValidationSchema}
      onSubmit={handleLogIn}
    >
      {(formik) => (
        <Form>
          <VStack align="stretch">
            <FormControl id="loginEmail" isRequired mb={2}>
              <FormLabel><strong>メールアドレス：</strong></FormLabel>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="メールアドレスを入力してください"
                    autoComplete="email"
                    bg="#3B2C2F"
                    borderColor="#E17875"
                    _placeholder={{ color: "gray.200" }}
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="loginPassword" isRequired mb={2}>
              <FormLabel><strong>パスワード：</strong></FormLabel>
              <InputGroup>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={pshow ? "text" : "password"}
                      placeholder="パスワードを入力してください"
                      bg="#3B2C2F"
                      borderColor="#E17875"
                      _placeholder={{ color: "gray.200" }}
                    />
                  )}
                </Field>
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setPShow(!pshow)}
                    variant="ghost"
                    aria-label={pshow ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    <FontAwesomeIcon
                      icon={pshow ? faEyeSlash : faEye}
                      style={{ color: "#E17875" }}
                    />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <ErrorMessage
                name="password"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>
            
            <Button
              colorScheme="teal"
              width="100%"
              mt={4}
              type="submit"
              isLoading={formik.isSubmitting}
            >
              ログイン
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>

  );
};

export default Login;