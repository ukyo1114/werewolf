import { useCallback } from "react";
import {
  Button,
  Input,
  FormControl, FormLabel,
  ModalBody, ModalFooter,
} from "@chakra-ui/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import useNotification from "../../hooks/useNotification.js";
import { reqPasswordResetSchema } from "./validationSchema";
import { messages } from "../../messages.js";

export const RequestPasswordReset = () => {
  const showToast = useNotification();

  const handleSubmit = useCallback(async (values, actions) => {
    const { email } = values;
    actions.setSubmitting(true);

    try {
      const config = { headers: { "Content-Type": "application/json" } };

      await axios.post("/api/verify/reset-pass", { email }, config);
      
      showToast(messages.PASSWORD_RESET.email(email), "success");
      actions.setSubmitting(false);
    } catch (error) {
      const errorMessage = error.response?.data?.error || "送信に失敗しました"
      showToast(errorMessage, "error");
    }
  }, [showToast]);

  return (
      <Formik
        initialValues={{ email: "" }}
        validationSchema={reqPasswordResetSchema}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <ModalBody>
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
};