import { useCallback } from "react";
import axios from "axios";
import { useUserState } from "../context/userProvider";
import useNotification from "./notification";
import { errors } from "../messages";

export const useEnterToChannel = () => {
  const { user, setCurrentChannel } = useUserState();
  const showToast = useNotification();

  const enterToChannel = useCallback(async (channelId, password) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.post(
        "/api/channel/enter",
        { channelId: channelId, password: password || "" },
        config,
      );
      setCurrentChannel(data);
    } catch (error) {
      showToast(error?.response?.data?.error || errors.CHANNEL_ENTER_FAILED, "error");
    }
  }, [user.token, setCurrentChannel, showToast]);

  return enterToChannel;
};