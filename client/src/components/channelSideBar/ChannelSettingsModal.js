import {
  Button,
  FormControl,
  Checkbox,
  Input,
  Textarea,
  Modal,
  ModalBody,
  Flex,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import React, { useCallback } from "react";
import axios from "axios";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { chSettingsValidationSchema } from "./validationSchema";
import TextareaAutosize from "react-textarea-autosize";

const ChannelSettingsModal = ({ isOpen, onClose }) => {
  const { user, currentChannel, setCurrentChannel } = useUserState();
  const showToast = useNotification();

  const handleSubmit = useCallback(async (values, actions) => {
    if (currentChannel.channelAdmin !== user._id) return;
    const {
      channelName,
      description,
      password,
      isChannelNameChanged,
      isDescriptionChanged,
      isPasswordChanged,
    } = values;
    actions.setSubmitting(true);
    
    const payload = {
      channelId: currentChannel._id,
    };
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

      setCurrentChannel((prevCurrentChannel) => ({
        ...prevCurrentChannel,
        channelName: data.channelName,
        description: data.description,
      }));
      showToast(messages.CHANNEL_SETTINGS_CHANGED, "success");
    } catch (error) {
      showToast(
        error?.response?.data?.message || errors.CHANNEL_SETTINGS_FAILED,
        "error",
      );
    } finally {
      actions.setSubmitting(false);
    }
  }, [
    currentChannel.channelAdmin,
    currentChannel._id,
    user._id,
    user.token,
    setCurrentChannel,
    showToast,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <Formik
        initialValues={{
          isChannelNameChanged: false,
          isDescriptionChanged: false,
          isPasswordChanged: false,
          channelName: currentChannel.channelName,
          description: currentChannel.description,
          password: "",
        }}
        validationSchema={chSettingsValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <ModalContent>
              <ModalHeader>チャンネル設定</ModalHeader>
              <ModalBody
                display="flex"
                flexDirection="column"
                alignItems="stretch"
              >
                <FormControl id="isChannelNameChanged">
                  <Field name="isChannelNameChanged">
                    {({ field }) => (
                      <Checkbox
                        {...field}
                        isChecked={field.value}
                        alignSelf="flex-start"
                      >
                        チャンネル名を変更する
                      </Checkbox>
                    )}
                  </Field>
                </FormControl>

                <FormControl id="channelName">
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

                <FormControl id="isDescriptionChanged">
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

                <FormControl id="description">
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
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="description"
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
                        パスワード設定
                      </Checkbox>
                    )}
                  </Field>
                </FormControl>

                <FormControl id="password">
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
}

export default ChannelSettingsModal;