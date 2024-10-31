import { useCallback } from "react";
import axios from "axios";
import { useUserState } from "../context/userProvider";
import useNotification from "./notification";
import { errors } from "../messages";

export const useJoinChannel = () => {
  const { user, cDispatch } = useUserState();
  const showToast = useNotification();

  const joinChannel = useCallback(async (channelId, password) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.post(
        "/api/channel/enter",
        { channelId: channelId, password: password || "" },
        config,
      );
      cDispatch({ type: "JOIN_CHANNEL", payload: data });
    } catch (error) {
      showToast(error?.response?.data?.error || errors.CHANNEL_ENTER_FAILED, "error");
    }
  }, [user.token, cDispatch, showToast]);

  return joinChannel;
};