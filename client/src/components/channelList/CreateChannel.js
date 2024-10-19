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
import { useUserState } from "../../context/userProvider";
import React, { useCallback } from "react";
import axios from "axios";
import useNotification from "../../hooks/notification";
import { errors, messages } from "../../messages";
import { Formik, Form, Field, ErrorMessage } from "formik";
import {
  createChValidationSchema,
  createChInitialValues,
} from "./validationSchema";
import TextareaAutosize from "react-textarea-autosize";

const CreateChannel = () => {
  const showToast = useNotification();
  const { user, setCurrentChannel } = useUserState();

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
      setCurrentChannel(data);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || errors.CHANNEL_CREATION_FAILED;
      showToast(errorMessage, "error");
      actions.setSubmitting(false);
    }
  }, [setCurrentChannel, showToast, user.token]);

  return (
    <Formik
      initialValues={createChInitialValues}
      validationSchema={createChValidationSchema}
      onSubmit={handleSubmit}
    >
      {(formik) => (
        <Form>
          <ModalBody>
            <FormControl id="channelName" mb={2}>
              <FormLabel><strong>チャンネル名：</strong></FormLabel>
              <Field name="channelName">
                {({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="チャンネル名を入力してください"
                    autoComplete="off"
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

            <FormControl id="description" mb={2}>
              <FormLabel><strong>チャンネル説明：</strong></FormLabel>
              <Field name="description">
                {({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="チャンネル説明を入力してください"
                    minHeight="100px"
                    maxHeight="600px"
                    autoComplete="off"
                    resize="none"
                    as={TextareaAutosize}
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

            <FormControl id="isPasswordEnabled" mb={2}>
              <Field name="isPasswordEnabled">
                {({ field }) => (
                  <Checkbox
                    {...field}
                    isChecked={field.value}
                  >
                    <strong>パスワード設定</strong>
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
            }
          </ModalBody>

          <ModalFooter justifyContent="center">
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
