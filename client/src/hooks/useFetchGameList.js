import { errors } from "../messages";
import { useCallback, useState } from "react";
import axios from "axios";
import { useNotification } from "./useNotification";

const useFetchGameList = (token, channelId) => {
  const [gameList, setGameList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useNotification();

  const fetchGameList = useCallback(async () => {
    setIsLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const { data } = await axios.get(
        `/api/spectate/game-list/${channelId}`,
        config
      );
      setGameList(data);
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.FETCH_GAME_LIST,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, channelId, showToast]);

  return { gameList, isLoading, fetchGameList };
};

export default useFetchGameList;
