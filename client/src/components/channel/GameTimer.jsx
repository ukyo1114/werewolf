import { useCallback, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import Countdown from "react-countdown";

import { Flex } from "@chakra-ui/react";

import { useUserState } from "../../context/UserProvider.jsx";
import useNotification from "../../hooks/useNotification";
import { useJoinChannel } from "../../hooks/useJoinChannel";
import { errors } from "../../messages";
import { PHASE_MAP, ROLE_MAP, PHASE_DURATIONS } from "../../constants";
import { DisplayRole, DisplayPhase } from "../miscellaneous/CustomComponents";

const GameTimer = () => {
  const { user, uDispatch, currentChannel, chDispatch } = useUserState();
  const { _id: channelId, channel, isGame, phase } = currentChannel;
  const { currentDay, currentPhase, changedAt } = phase;
  const showToast = useNotification();
  const gameSocketRef = useRef(null);
  const joinChannel = useJoinChannel();

  const fetchUserState = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get(
        `/api/game/player-state/${channelId}`, config
      );
      uDispatch({ type: "JOIN_GAME", payload: data });
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.PLAYER_LOAD_FAILED, "error"
      );
    }
  }, [showToast, user.token, channelId, uDispatch]);

  const timerEnd = useMemo(() => {
    const duration = PHASE_DURATIONS[currentPhase] * 1000;
    return new Date(changedAt).getTime() + duration;
  }, [currentPhase, changedAt]);

  useEffect(() => {
    if (isGame) fetchUserState();
    
    return () => uDispatch({ type: "LEAVE_GAME" });
  }, [isGame, fetchUserState, uDispatch]);

  useEffect(() => {
    if (gameSocketRef.current || !isGame) return;

    const auth = { auth: { token: user.token } };
    gameSocketRef.current = io(
      `${import.meta.env.VITE_SERVER_URL}/game`,
      auth,
    );

    gameSocketRef.current.on("connect", async () => {
      try {
        const { gameState } = await gameSocketRef.current.emitWithAck(
          "joinGame", channelId
        );

        if (!gameState) {
          showToast(errors.GAME_NOT_FOUND, "error");
          await joinChannel(channel._id);
        }
        
        chDispatch({ type: "UPDATE_GAME_STATE", payload: gameState });
        uDispatch({ type: "UPDATE_STATUS", payload: gameState });
      } catch (error) {
        showToast(
          error?.response?.data?.message || errors.CONNECTION_FAILED, "error"
        );
        gameSocketRef.current.disconnect();
      }
    });

    gameSocketRef.current.on(
      "updateGameState",
      (gameState) => {
        chDispatch({ type: "UPDATE_GAME_STATE", payload: gameState });
        uDispatch({ type: "UPDATE_STATUS", payload: gameState });
      }
    );

    gameSocketRef.current.on(
      "connect_error", (err) => showToast(err.message, "error")
    );

    return () => {
      if (gameSocketRef.current) {
        gameSocketRef.current.disconnect();
      }
    };
  }, [
    isGame,
    user.token,
    channelId,
    channel,
    showToast,
    uDispatch,
    chDispatch,
    joinChannel,
  ]);

  return (
    <>
      <Flex alignItems="center">
        <DisplayPhase mr={2}>
          {currentDay}日目
        </DisplayPhase>
        <DisplayPhase>
          {PHASE_MAP[currentPhase || "pre"]}
        </DisplayPhase>
      </Flex>

      {currentPhase && changedAt &&
        <Countdown
          key={timerEnd}
          date={timerEnd}
          renderer={({ minutes, seconds }) => (minutes * 60 + seconds)} 
        />
      }
      <DisplayRole status={user.status}>
        {ROLE_MAP[user.role || "spectator"]}
      </DisplayRole>
    </>
  );
};

export default GameTimer;
