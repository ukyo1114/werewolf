import { useCallback } from "react";
import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";

import {
  Stack,
  FormControl,
  Checkbox,
  Input,
  Textarea,
  FormLabel,
} from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { useUserState } from "../../context/UserProvider.jsx";
import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import {
  createChValidationSchema, createChInitialValues,
} from "./validationSchema";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";


const CreateChannel = () => {
  const showToast = useNotification();
  const { user, chDispatch } = useUserState();

  const handleSubmit = useCallback(async (values, actions) => {
    const { channelName, description, password, isPasswordEnabled } = values;
    actions.setSubmitting(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        channelName,
        description,
        password: isPasswordEnabled ? password : "", 
      }

      const { data: { channel } } = await axios.post(
        "/api/channel/create",
        payload,
        config,
      );
      
      actions.setSubmitting(false);
      showToast(messages.CHANNEL_CREATED, "success");
      chDispatch({ type: "JOIN_CHANNEL", payload: channel });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || errors.CHANNEL_CREATION_FAILED;
      showToast(errorMessage, "error");
      actions.setSubmitting(false);
    }
  }, [chDispatch, showToast, user.token]);

  return (
    <Stack w="100%" overflow="hidden">
      <Formik
        initialValues={createChInitialValues}
        validationSchema={createChValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form
            style={{
              display: "flex", flexDirection: "column", overflow: "auto"
            }}
          >
            <FormControl id="channelName" mb={3}>
              <FormLabel><EllipsisText>チャンネル名</EllipsisText></FormLabel>
              <Field name="channelName">
                {({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="チャンネル名"
                    autoComplete="off"
                  />
                )}
              </Field>
              <ErrorMessage
                name="channelName"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl
              id="description"
              display="flex"
              flexDir="column"
              overflow="auto"
              mb={3}
            >
              <FormLabel><EllipsisText>説明文</EllipsisText></FormLabel>
              <Field name="description">
                {({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="説明文"
                    autoComplete="off"
                    resize="none"
                    as={TextareaAutosize}
                  />
                )}
              </Field>
              <ErrorMessage
                name="description"
                component="div"
                style={{ color: "red", fontSize: "smaller" }}
              />
            </FormControl>

            <FormControl id="isPasswordEnabled" mb={2}>
              <Field name="isPasswordEnabled">
                {({ field }) => (
                  <Checkbox
                    {...field}
                    isChecked={field.value}
                  >
                    <EllipsisText>パスワードを設定する</EllipsisText>
                  </Checkbox>
                )}
              </Field>
            </FormControl>
            
            {formik.values.isPasswordEnabled &&
              <FormControl id="password" mb={3}>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="パスワード"
                      autoComplete="off"
                      isDisabled={!formik.values.isPasswordEnabled}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
                  component="div"
                  style={{ color: "red", fontSize: "smaller" }}
                />
              </FormControl>
            }

            <ModalButton type="submit" isLoading={formik.isSubmitting} >
              作成
            </ModalButton>
          </Form>
        )}
      </Formik>
    </Stack>
  );
};

export default CreateChannel;
