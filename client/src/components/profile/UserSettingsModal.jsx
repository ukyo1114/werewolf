import { useState, useCallback } from "react";
import axios from "axios";

import {
  Stack,
  Button,
  FormControl, FormLabel,
  Checkbox,
  Input, InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";

import { useUserState } from "../../context/UserProvider.jsx";
import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import {
  userSettingsValidationSchema, userSettingsInitialValues,
} from "./validationSchema";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";

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

      if (payload.email) showToast(messages.USER_SETTINGS.email);
      if (payload.newPassword) showToast(messages.USER_SETTINGS.password, "success");
    } catch (error) {
      showToast(error?.response?.data?.error || errors.USER_SETTINGS_FAILED, "error");
    }
  }, [user.token, showToast]);

  return (
    <Stack w="100%" overflow="hidden">
      <Formik
        initialValues={userSettingsInitialValues}
        validationSchema={userSettingsValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
            <Form
              style={{
                display: "flex", flexDirection: "column", overflow: "auto"
              }}
            >
            <FormControl id="isEmailChanged" mb={2}>
              <Field name="isEmailChanged">
                {({ field }) => (
                  <Checkbox
                    {...field}
                    isChecked={field.value}
                  >
                    <EllipsisText>メールアドレスを変更する</EllipsisText>
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
                    placeholder="メールアドレス"
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

            <FormControl id="isPasswordChanged" mb={2}>
              <Field name="isPasswordChanged">
                {({ field }) => (
                  <Checkbox
                    {...field}
                    isChecked={field.value}
                  >
                    <EllipsisText>パスワードを変更する</EllipsisText>
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
                      pr="4rem"
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
                    color="gray.700"
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

            <FormControl id="confirmNewPass" mb={3}>
              <InputGroup>
                <Field name="confirmNewPass">
                  {({ field }) => (
                    <Input
                      {...field}
                      type={confirmNewPassShow ? "text" : "password"}
                      placeholder="新しいパスワード(確認)"
                      isDisabled={!formik.values.isPasswordChanged}
                      autoComplete="off"
                      pr="4rem"
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
                    color="gray.700"
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

            <FormControl id="currentPassword" mb={3}>
              <FormLabel><EllipsisText>現在のパスワード</EllipsisText></FormLabel>
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
                      pr="4rem"
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
                    color="gray.700"
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
            
            <ModalButton type="submit" isLoading={formik.isSubmitting}>
              送信
            </ModalButton>
          </Form>
        )}
      </Formik>
    </Stack>
  );
};

export default UserSettingsModal;