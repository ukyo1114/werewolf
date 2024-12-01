import { useCallback } from "react";
import axios from "axios";

import {
  Stack, FormControl, Checkbox, Input, Textarea,
} from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { useUserState } from "../../context/UserProvider.jsx";
import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import { chSettingsValidationSchema } from "./validationSchema";
import TextareaAutosize from "react-textarea-autosize";
import ModalButton from "../miscellaneous/ModalButton.jsx";

const ChannelSettingsModal = () => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId, channelAdmin, channelName, description } = currentChannel;
  const showToast = useNotification();

  const handleSubmit = useCallback(async (values, actions) => {
    if (channelAdmin !== user._id) return;
    const {
      channelName,
      description,
      password,
      isChannelNameChanged,
      isDescriptionChanged,
      isPasswordChanged,
    } = values;
    actions.setSubmitting(true);
    
    const payload = { channelId };
    if (isChannelNameChanged && channelName) payload.channelName = channelName;
    if (isDescriptionChanged && description) payload.description = description;
    if (isPasswordChanged) payload.password = password;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.put(
        "/api/channel/settings",
        payload,
        config,
      );

      showToast(messages.CHANNEL_SETTINGS_CHANGED, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.CHANNEL_SETTINGS_FAILED,
        "error",
      );
    } finally {
      actions.setSubmitting(false);
    }
  }, [channelAdmin, channelId, user._id, user.token, showToast]);

  return (
    <Stack w="100%" overflow="hidden">
      <Formik
        initialValues={{
          isChannelNameChanged: false,
          isDescriptionChanged: false,
          isPasswordChanged: false,
          channelName,
          description,
          password: "",
        }}
        validationSchema={chSettingsValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
            <Form
              style={{
                display: "flex", flexDirection: "column", overflow: "auto"
              }}
            >
              <FormControl id="isChannelNameChanged" mb={2}>
                <Field name="isChannelNameChanged">
                  {({ field }) => (
                    <Checkbox
                      {...field}
                      isChecked={field.value}
                    >
                      チャンネル名を変更する
                    </Checkbox>
                  )}
                </Field>
              </FormControl>

              <FormControl id="channelName" mb={3}>
                <Field name="channelName">
                  {({ field }) => (
                    <Input
                      {...field}
                      placeholder="チャンネル名"
                      autoComplete="off"
                      isDisabled={!formik.values.isChannelNameChanged}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="channelName"
                  component="div"
                  style={{ color: "red", fontSize: "smaller" }}
                />
              </FormControl>

              <FormControl id="isDescriptionChanged" mb={2}>
                <Field name="isDescriptionChanged">
                  {({ field }) => (
                    <Checkbox
                      {...field}
                      isChecked={field.value}
                      alignSelf="flex-start"
                    >
                      チャンネル説明を変更する
                    </Checkbox>
                  )}
                </Field>
              </FormControl>

              <FormControl
                id="description"
                display="flex"
                flexDir="column"
                overflow="auto"
                mb={3}
              >
                <Field name="description">
                  {({ field }) => (
                    <Textarea
                      {...field}
                      placeholder="チャンネル説明"
                      autoComplete="off"
                      resize="none"
                      as={TextareaAutosize}
                      isDisabled={!formik.values.isDescriptionChanged}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="description"
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
                      パスワード設定
                    </Checkbox>
                  )}
                </Field>
              </FormControl>

              <FormControl id="password" mb={3}>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      placeholder="空欄のまま送信すると無効にできます"
                      autoComplete="off"
                      isDisabled={!formik.values.isPasswordChanged}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
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
}

export default ChannelSettingsModal;