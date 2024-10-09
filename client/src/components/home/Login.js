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
      const errorMessage = error?.response?.data?.error || errors.LOGIN_FAILED;
      showToast(errorMessage, "error");
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginValidationSchema}
      onSubmit={handleLogIn}
    >
      {(formik) => (
        <Form>
          <VStack spacing={4} align="stretch">
            <FormControl id="loginEmail" isRequired>
              <FormLabel>メールアドレス</FormLabel>
              <Field
                as={Input}
                name="email"
                type="email"
                placeholder="メールアドレスを入力してください"
                autoComplete="email"
              />
              <ErrorMessage
                name="email"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="loginPassword" isRequired>
              <FormLabel>パスワード</FormLabel>
              <InputGroup>
                <Field
                  as={Input}
                  name="password"
                  type={pshow ? "text" : "password"}
                  placeholder="パスワードを入力してください"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="1.75rem"
                    size="sm"
                    onClick={() => setPShow(!pshow)}
                    variant="ghost"
                    aria-label={pshow ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    <FontAwesomeIcon icon={pshow ? faEyeSlash : faEye} />
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
              colorScheme="twitter"
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