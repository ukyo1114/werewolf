import {
  Button,
  FormControl,
  Checkbox,
  Input,
  Textarea,
  ModalBody,
  ModalFooter,
  FormLabel,
} from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import React, { useCallback } from "react";
import axios from "axios";
import useNotification from "../../hooks/useNotification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  createChValidationSchema,
  createChInitialValues,
} from "./validationSchema";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";
import TextareaAutosize from "react-textarea-autosize";

const CreateChannel = () => {
  const showToast = useNotification();
  const { user, cDispatch } = useUserState();

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

      const { data } = await axios.post(
        "/api/channel/create",
        payload,
        config,
      );
      
      actions.setSubmitting(false);
      showToast(messages.CHANNEL_CREATED, "success");
      cDispatch({ type: "JOIN_CHANNEL", payload: data });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || errors.CHANNEL_CREATION_FAILED;
      showToast(errorMessage, "error");
      actions.setSubmitting(false);
    }
  }, [cDispatch, showToast, user.token]);

  return (
    <Formik
      initialValues={createChInitialValues}
      validationSchema={createChValidationSchema}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form>
          <ModalBody>
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

            <FormControl id="description" mb={3}>
              <FormLabel><EllipsisText>説明文</EllipsisText></FormLabel>
              <Field name="description">
                {({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="説明文"
                    minHeight="100px"
                    maxHeight="600px"
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

            <FormControl id="isPasswordEnabled" mb={3} overflow="hidden">
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
              <FormControl id="password">
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
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="teal"
              width="100%"
              type="submit"
              isLoading={formik.isSubmitting}
            >
              作成
            </Button>
          </ModalFooter>
        </Form>
      )}
    </Formik>
  );
};

export default CreateChannel;
