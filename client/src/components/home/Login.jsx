import { Suspense, lazy, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Text,
  Button,
  VStack,
  FormControl, FormLabel,
  Input, InputGroup, InputRightElement,
  useDisclosure,
} from "@chakra-ui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginValidationSchema } from "./validationSchema";

const ModalTemplete = lazy(() => import("../miscellaneous/ModalTemplete.jsx"));
const RequestPResetModal = lazy(() => import("./RequestPResetModal.jsx"));

const Login = () => {
  const [pshow, setPShow] = useState(false);
  const showToast = useNotification();
  const navigate = useNavigate();
  const resetPass = useDisclosure();

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
      const { resendToken } = error.response?.data;
      if (error.response?.status === 403 && resendToken) {
        actions.setSubmitting(false);
        return navigate(`/verification/${resendToken}`);
      };

      handleError(error);
      actions.setSubmitting(false);
    }
  };

  function handleError(error) {
    const errorMessage = error?.response?.data?.error || errors.LOGIN_FAILED;
    showToast(errorMessage, "error");
  };

  return (
    <>
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
                        pr="4rem"
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
                      color="gray.700"
                    >
                      <FontAwesomeIcon icon={pshow ? faEyeSlash : faEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <Text
                  as="span"
                  color="blue.500"
                  fontSize="sm"
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                  onClick={resetPass.onOpen}
                >
                  パスワードを忘れた方はこちら
                </Text>
                <ErrorMessage
                  name="password"
                  component="div"
                  style={{ color: "red", fontSize: "smaller" }}
                />
              </FormControl>
              
              <Button
                mt={7}
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

      <Suspense fallback={<div>Loading...</div>}>
        <ModalTemplete
          isOpen={resetPass.isOpen} onClose={resetPass.onClose}
          title="パスワード再設定"
        >
          <RequestPResetModal />
        </ModalTemplete>
      </Suspense>
    </>
  );
};

export default Login;