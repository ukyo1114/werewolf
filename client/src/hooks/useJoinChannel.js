import { useCallback } from "react";
import axios from "axios";
import { useUserState } from "../context/UserProvider.jsx";
import useNotification from "./useNotification";
import { errors } from "../messages";

export const useJoinChannel = () => {
  const { user, chDispatch } = useUserState();
  const showToast = useNotification();

  const joinChannel = useCallback(async (channelId, password) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data: { channel } } = await axios.post(
        "/api/channel/enter",
        { channelId, password: password || "" },
        config,
      );
      chDispatch({ type: "JOIN_CHANNEL", payload: channel });
    } catch (error) {
      showToast(error?.response?.data?.error || errors.CHANNEL_ENTER_FAILED, "error");
    }
  }, [user.token, chDispatch, showToast]);

  return joinChannel;
};