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

const CreateChannelModal = ({ isOpen, onClose }) => {
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
      onClose();
      showToast(messages.CHANNEL_CREATED, "success");
      setCurrentChannel(data);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || errors.CHANNEL_CREATION_FAILED;
      showToast(errorMessage, "error");
      actions.setSubmitting(false);
    }
  }, [onClose, setCurrentChannel, showToast, user.token]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <Formik
        initialValues={createChInitialValues}
        validationSchema={createChValidationSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <ModalContent>
              <ModalHeader fontSize="35px" display="flex" justifyContent="center">
                チャンネル作成
              </ModalHeader>

              <ModalBody
                display="flex"
                flexDirection="column"
                spacing={4}
                alignItems="stretch"
              >
                <FormControl id="channelName">
                  <FormLabel>チャンネル名</FormLabel>
                  <Field
                    as={Input}
                    name="channelName"
                    type="text"
                    placeholder="チャンネル名を入力してください"
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="channelName"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <FormControl id="description">
                  <FormLabel>チャンネル説明</FormLabel>
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
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="description"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>

                <FormControl>
                  <Field
                    as={Checkbox}
                    name="isPasswordEnabled"
                    type="checkbox"
                    alignSelf="flex-start"
                  >
                    パスワード設定
                  </Field>
                </FormControl>

                <FormControl id="password">
                  <FormLabel>パスワード</FormLabel>
                  <Field
                    as={Input}
                    name="password"
                    type="text"
                    placeholder="パスワードを入力してください"
                    autoComplete="off"
                    isDisabled={!formik.values.isPasswordEnabled}
                  />
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
                    OK
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

export default CreateChannelModal;
