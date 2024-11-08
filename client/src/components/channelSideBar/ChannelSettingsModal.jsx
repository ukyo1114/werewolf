import {
  Button,
  FormControl,
  Checkbox,
  Input,
  Textarea,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider.jsx";
import React, { useCallback } from "react";
import axios from "axios";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { chSettingsValidationSchema } from "./validationSchema";
import TextareaAutosize from "react-textarea-autosize";

const ChannelSettingsModal = () => {
  const { user, currentChannel, cDispatch } = useUserState();
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

      const { data } = await axios.put(
        "/api/channel/settings",
        payload,
        config,
      );

      cDispatch({ type: "CHANNEL_SETTINGS", payload: data }); // socketを使用して全員に通知
      showToast(messages.CHANNEL_SETTINGS_CHANGED, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.CHANNEL_SETTINGS_FAILED,
        "error",
      );
    } finally {
      actions.setSubmitting(false);
    }
  }, [channelAdmin, channelId, user._id, user.token, cDispatch, showToast]);

  return (
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
        <Form>
          <ModalBody>
            <FormControl id="isChannelNameChanged" mb={2}>
              <Field name="isChannelNameChanged">
                {({ field }) => (
                  <Checkbox
                    {...field}
                    isChecked={field.value}
                  >
                    <strong>チャンネル名を変更する</strong>
                  </Checkbox>
                )}
              </Field>
            </FormControl>

            <FormControl id="channelName" mb={2}>
              <Field name="channelName">
                {({ field }) => (
                  <Input
                    {...field}
                    placeholder="チャンネル名"
                    autoComplete="off"
                    isDisabled={!formik.values.isChannelNameChanged}
                    bg="#3B2C2F"
                    borderColor="#E17875"
                    _placeholder={{ color: "gray.200" }}
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

            <FormControl id="description" mb={2}>
              <Field name="description">
                {({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="チャンネル説明"
                    minHeight="100px"
                    maxHeight="600px"
                    autoComplete="off"
                    resize="none"
                    as={TextareaAutosize}
                    isDisabled={!formik.values.isDescriptionChanged}
                    bg="#3B2C2F"
                    borderColor="#E17875"
                    _placeholder={{ color: "gray.200" }}
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
                    alignSelf="flex-start"
                  >
                    パスワード設定
                  </Checkbox>
                )}
              </Field>
            </FormControl>

            <FormControl id="password" mb={2}>
              <Field name="password">
                {({ field }) => (
                  <Input
                    {...field}
                    placeholder="空欄のまま送信すると無効にできます"
                    autoComplete="off"
                    isDisabled={!formik.values.isPasswordChanged}
                    bg="#3B2C2F"
                    borderColor="#E17875"
                    _placeholder={{ color: "gray.200" }}
                  />
                )}
              </Field>
              <ErrorMessage
                name="password"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="teal"
              width="100%"
              type="submit"
              isLoading={formik.isSubmitting}
            >
              送信
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  );
}

export default ChannelSettingsModal;