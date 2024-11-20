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
import useNotification from "../../hooks/useNotification";
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

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config,
      );
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
          <VStack>
            <FormControl id="loginEmail" isRequired mb={3}>
              <FormLabel>メールアドレス</FormLabel>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="メールアドレス"
                    autoComplete="email"
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="loginPassword" isRequired mb={3}>
              <FormLabel>パスワード</FormLabel>
              <InputGroup>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={pshow ? "text" : "password"}
                      placeholder="パスワード"
                      pr="4.5rem"
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
              mt={8}
              colorScheme="teal"
              width="100%"
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