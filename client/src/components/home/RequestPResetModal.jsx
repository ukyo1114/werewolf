import { useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Stack,
  Input,
  FormControl, FormLabel,
} from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import useNotification from "../../hooks/useNotification.js";
import { reqPasswordResetSchema } from "./validationSchema";
import { messages } from "../../messages.js";
import ModalButton from "../miscellaneous/ModalButton.jsx";

const RequestPResetModal = () => {
  const navigate = useNavigate();
  const showToast = useNotification();

  const handleSubmit = useCallback(async (values, actions) => {
    const { email } = values;
    actions.setSubmitting(true);

    try {
      const config = { headers: { "Content-Type": "application/json" } };

      await axios.post("/api/verify/request-password-reset", { email }, config);
      
      showToast(messages.PASSWORD_RESET.email(email), "success");
      actions.setSubmitting(false);
    } catch (error) {
      const { resendToken } = error.response?.data;
      if (error.response?.status === 403 && resendToken) {
        actions.setSubmitting(false);
        return navigate(`/verification/${resendToken}`);
      };
      
      const errorMessage = error.response?.data?.error || "送信に失敗しました"
      showToast(errorMessage, "error");
    }
  }, [navigate, showToast]);

  return (
    <Stack w="100%" overflow="hidden">
      <Formik
        initialValues={{ email: "" }}
        validationSchema={reqPasswordResetSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form
            style={{
              display: "flex", flexDirection: "column", overflow: "auto"
            }}
          >
            <FormControl id="Email" isRequired mb={3}>
              <FormLabel>メールアドレス</FormLabel>
              <Field name="email">
                {({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="メールアドレス"
                    autoComplete="email"
                  />
                )}
              </Field>
              <ErrorMessage
                name="email"
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

export default RequestPResetModal;