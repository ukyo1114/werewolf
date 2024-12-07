import axios from "axios";
import { useNavigate } from "react-router-dom";

import useNotification from "../../../hooks/useNotification";
import { errors, messages } from "../../../messages";

const useSignup = () => {
  const showToast = useNotification();
  const navigate = useNavigate();

  const handleError = (error) => {
    const errorMessage = error?.response?.data?.error || errors.SIGNUP_FAILED;
    showToast(errorMessage, "error");
  };

  const handleSubmit = async(values, pic) => {
    const config = { headers: { "Content-Type": "application/json" } };

    const { data: { token } } = await axios.post(
      "/api/user/signup",
      { ...values, pic },
      config,
    );

    return token;
  };

  const handleSignup = async(values, actions, pic) => {
    if (!pic) return showToast(errors.NO_IMAGE_SELECTED, "warning");

    actions.setSubmitting(true);

    try {
      const token = await handleSubmit(values, pic);
      showToast(messages.USER_REGISTERED, "success");
      navigate(`/verification/${token}`);
    } catch (error) {
      handleError(error);
    } finally {
      actions.setSubmitting(false);
    }
  };

  return { handleSignup };
};

export default useSignup;