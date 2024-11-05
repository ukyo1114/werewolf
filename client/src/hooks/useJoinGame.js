import { useCallback } from "react";
import { useUserState } from "../context/userProvider";
import axios from "axios";
import useNotification from "./notification";
import { errors } from "../messages";

const useJoinGame = () => {
  const { user, cDispatch } = useUserState();
  const showToast = useNotification();

  const joinGame = useCallback(async (gameId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/game/join/${gameId}`, config);

      cDispatch({ type: "JOIN_GAME", payload: data });
    } catch (error) {
      showToast(error?.response?.data?.error || errors.CHANNEL_ENTER_FAILED, "error");
    }
  }, [cDispatch, showToast, user.token]);

  return joinGame;
};

export default useJoinGame;