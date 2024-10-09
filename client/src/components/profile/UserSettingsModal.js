import {
  Button,
  FormControl,
  FormLabel,
  Checkbox,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  Flex,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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

const UserSettingsModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useUserState();
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

      const { data } = await axios.put(
        "/api/user/settings",
        payload,
        config,
      );
      setUser((prevUser) => {
        return {
          ...prevUser,
          email: data.email,
        }
      });
      showToast(messages.USER_SETTINGS_UPDATED, "success");
      onClose();
    } catch (error) {
      showToast(errors.USER_SETTINGS_FAILED, "error");
    }
  }, [user.token, setUser, showToast, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="none">
      <ModalOverlay />
      <Formik
        initialValues={userSettingsInitialValues}
        validationSchema={userSettingsValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <ModalContent>
              <ModalHeader>ユーザー設定</ModalHeader>
              <ModalBody
                display="flex"
                flexDirection="column"
                alignItems="stretch"
              >
                <FormControl id="isEmailChanged">
                  <Field name="isEmailChanged">
                    {({ field }) => (
                      <Checkbox
                        {...field}
                        isChecked={field.value}
                        alignSelf="flex-start"
                      >
                        メールアドレスを変更する
                      </Checkbox>
                    )}
                  </Field>
                </FormControl>

                <FormControl id="email">
                  <Field name="email">
                    {({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="メールアドレスを入力してください"
                        autoComplete="email"
                        isDisabled={!formik.values.isEmailChanged}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="email"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <FormControl id="isPasswordChanged">
                  <Field name="isPasswordChanged">
                    {({ field }) => (
                      <Checkbox
                        {...field}
                        isChecked={field.value}
                        alignSelf="flex-start"
                      >
                        パスワードを変更する
                      </Checkbox>
                    )}
                  </Field>
                </FormControl>

                <FormControl id="newPassword">
                  <FormLabel>新しいパスワード</FormLabel>
                  <InputGroup>
                    <Field name="newPassword">
                      {({ field }) => (
                        <Input
                          {...field}
                          type={newPassShow ? "text" : "password"}
                          placeholder="新しいパスワード"
                          isDisabled={!formik.values.isPasswordChanged}
                        ></Input>
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
                        <FontAwesomeIcon icon={newPassShow ? faEyeSlash : faEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <FormControl id="confirmNewPass">
                  <FormLabel>新しいパスワード確認用</FormLabel>
                  <InputGroup>
                    <Field name="confirmNewPass">
                      {({ field }) => (
                        <Input
                          {...field}
                          type={confirmNewPassShow ? "text" : "password"}
                          placeholder="新しいパスワード確認用"
                          isDisabled={!formik.values.isPasswordChanged}
                        ></Input>
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
                        <FontAwesomeIcon icon={confirmNewPassShow ? faEyeSlash : faEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <ErrorMessage
                    name="confirmNewPass"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <FormControl id="currentPassword">
                  <FormLabel>現在のパスワード</FormLabel>
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
                        ></Input>
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
                        <FontAwesomeIcon icon={currentPassShow ? faEyeSlash : faEye} />
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
                  <Button onClick={onClose}>Close</Button>
                  <Button
                    colorScheme="twitter"
                    type="submit"
                    isLoading={formik.isSubmitting}
                  >
                    送信
                  </Button>
                </Flex>
              </ModalFooter>
            </ModalContent>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default UserSettingsModal;