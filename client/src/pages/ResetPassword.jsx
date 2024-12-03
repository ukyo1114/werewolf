import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  Container,
  Stack,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input, InputGroup, InputRightElement,
} from "@chakra-ui/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

import { pResetInitialValues, pResetSchema } from "./validationSchema";
import useNotification from "../hooks/useNotification";
import { errors, messages } from "../messages";

const ResetPassword = () => {
  const [pshow, setPShow] = useState(false);
  const [cshow, setCShow] = useState(false);

  const showToast = useNotification();
  const navigate = useNavigate();
  const { token } = useParams();

  const handlePasswordReset = useCallback(async (values, actions) => {
    const { password } = values;
    actions.setSubmitting(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("/api/verify/reset-password", { password }, config);

      showToast(messages.USER_SETTINGS.password, "success");
      navigate("/");
    } catch (error) {
      showToast(error?.response?.data?.error || errors.PASSWORD_RESET_FAILED, "error");
    }
  }, [navigate, token, showToast]);

  return (
    <Container
      display="flex"
      centerContent
      maxW="xl"
    >
      <Stack w="100%" p={4}>
        <Text as="h1" fontSize="2xl" fontWeight="bold" color="gray.700">
          パスワード再設定
        </Text>
        <Formik
          initialValues={pResetInitialValues}
          validationSchema={pResetSchema}
          onSubmit={handlePasswordReset}
        >
          {(formik) => (
            <Form>
              <VStack>
                <FormControl id="password" isRequired my={3}>
                <FormLabel>新しいパスワード</FormLabel>
                  <InputGroup>
                    <Field name="password">
                      {({ field }) => (
                        <Input
                          {...field}
                          type={pshow ? "text" : "password"}
                          placeholder="新しいパスワード"
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
                  <ErrorMessage
                    name="password"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <FormControl id="confirmPassword" isRequired mb={3}>
                <FormLabel>新しいパスワード(確認)</FormLabel>
                  <InputGroup>
                    <Field name="confirmPassword">
                      {({ field }) => (
                        <Input
                          {...field}
                          type={cshow ? "text" : "password"}
                          placeholder="新しいパスワード(確認)"
                          pr="4rem"
                        />
                      )}
                    </Field>

                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => setCShow(!cshow)}
                        variant="ghost"
                        aria-label={cshow ? "パスワードを隠す" : "パスワードを表示"}
                        color="gray.700"
                      >
                        <FontAwesomeIcon icon={cshow ? faEyeSlash : faEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <Button
                  colorScheme="teal"
                  w="100%"
                  mt={8}
                  type="submit"
                  isLoading={formik.isSubmitting}
                >
                  パスワード再設定
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Stack>
    </Container>
  );
};

export default ResetPassword;