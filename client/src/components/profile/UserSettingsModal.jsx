import {
  Button,
  FormControl,
  FormLabel,
  Checkbox,
  Input,
  InputGroup,
  InputRightElement,
  ModalBody,
  Flex,
  ModalFooter,
} from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { useUserState } from "../../context/userProvider";
import React, { useState, useCallback } from "react";
import axios from "axios";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  userSettingsValidationSchema,
  userSettingsInitialValues,
} from "./validationSchema";

const UserSettingsModal = () => {
  const { user } = useUserState();
  const showToast = useNotification();
  const [newPassShow, setNewPassShow] = useState(false);
  const [confirmNewPassShow, setConfirmNewPassShow] = useState(false);
  const [currentPassShow, setCurrentPassShow] = useState(false);

  const handleSubmit = useCallback(async (values, actions) => {
    const {
      email,
      newPassword,
      currentPassword,
      isEmailChanged,
      isPasswordChanged,
    } = values;
    actions.setSubmitting(true);

    const payload = {
      currentPassword: currentPassword,
    };
    if (isEmailChanged && email) payload.email = email;
    if (isPasswordChanged && newPassword) payload.newPassword = newPassword;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.put(
        "/api/user/settings",
        payload,
        config,
      );

      showToast(messages.USER_SETTINGS_UPDATED, "success");
    } catch (error) {
      showToast(error?.response?.data?.error || errors.USER_SETTINGS_FAILED, "error");
    }
  }, [user.token, showToast]);

  return (
      <Formik
        initialValues={userSettingsInitialValues}
        validationSchema={userSettingsValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <ModalBody>
              <FormControl id="isEmailChanged" mb={2}>
                <Field name="isEmailChanged">
                  {({ field }) => (
                    <Checkbox
                      {...field}
                      isChecked={field.value}
                    >
                      <strong>メールアドレスを変更する</strong>
                    </Checkbox>
                  )}
                </Field>
              </FormControl>

              <FormControl id="email" mb={3}>
                <Field name="email">
                  {({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="メールアドレスを入力してください"
                      autoComplete="email"
                      isDisabled={!formik.values.isEmailChanged}
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

              <FormControl id="isPasswordChanged" mb={2}>
                <Field name="isPasswordChanged">
                  {({ field }) => (
                    <Checkbox
                      {...field}
                      isChecked={field.value}
                    >
                      <strong>パスワードを変更する</strong>
                    </Checkbox>
                  )}
                </Field>
              </FormControl>

              <FormControl id="newPassword" mb={3}>
                <InputGroup>
                  <Field name="newPassword">
                    {({ field }) => (
                      <Input
                        {...field}
                        type={newPassShow ? "text" : "password"}
                        placeholder="新しいパスワード"
                        isDisabled={!formik.values.isPasswordChanged}
                        autoComplete="off"
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
                      onClick={() => setNewPassShow(!newPassShow)}
                      variant="ghost"
                      aria-label={newPassShow ? "パスワードを隠す" : "パスワードを表示"}
                    >
                      <FontAwesomeIcon
                        icon={newPassShow ? faEyeSlash : faEye} 
                        style={{ color: "#E17875" }}
                      />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  style={{ color: "red", fontSize: "smaller" }}
                />
              </FormControl>

              <FormControl id="confirmNewPass" mb={3}>
                <InputGroup>
                  <Field name="confirmNewPass">
                    {({ field }) => (
                      <Input
                        {...field}
                        type={confirmNewPassShow ? "text" : "password"}
                        placeholder="新しいパスワード確認"
                        isDisabled={!formik.values.isPasswordChanged}
                        autoComplete="off"
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
                      onClick={() => setConfirmNewPassShow(!confirmNewPassShow)}
                      variant="ghost"
                      aria-label={confirmNewPassShow ? "パスワードを隠す" : "パスワードを表示"}
                    >
                      <FontAwesomeIcon
                        icon={confirmNewPassShow ? faEyeSlash : faEye}
                        style={{ color: "#E17875" }}
                        />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <ErrorMessage
                  name="confirmNewPass"
                  component="div"
                  style={{ color: "red", fontSize: "smaller" }}
                />
              </FormControl>

              <FormControl id="currentPassword" isRequired>
                <FormLabel><strong>現在のパスワード：</strong></FormLabel>
                <InputGroup>
                  <Field name="currentPassword">
                    {({ field }) => (
                      <Input
                        {...field}
                        type={currentPassShow ? "text" : "password"}
                        placeholder="現在のパスワード"
                        isDisabled={
                          !formik.values.isEmailChanged && !formik.values.isPasswordChanged
                        }
                        autoComplete="off"
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
                      onClick={() => setCurrentPassShow(!currentPassShow)}
                      variant="ghost"
                      aria-label={currentPassShow ? "パスワードを隠す" : "パスワードを表示"}
                    >
                      <FontAwesomeIcon
                        icon={currentPassShow ? faEyeSlash : faEye}
                        style={{ color: "#E17875" }}
                      />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <ErrorMessage
                  name="currentPassword"
                  component="div"
                  style={{ color: "red", fontSize: "smaller" }}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Flex width="100%" justifyContent="space-evenly">
                <Button
                  colorScheme="teal"
                  width="100%"
                  type="submit"
                  isLoading={formik.isSubmitting}
                >
                  送信
                </Button>
              </Flex>
            </ModalFooter>
          </Form>
        )}
      </Formik>
  );
};

export default UserSettingsModal;