import React, { useCallback, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import Countdown from "react-countdown";
import { useUserState } from "../../context/UserProvider.jsx";
import axios from "axios";
import "../styles.css";
import io from "socket.io-client";
import useNotification from "../../hooks/useNotification";
import { useJoinChannel } from "../../hooks/useJoinChannel";
import { errors } from "../../messages";
import { PHASE_MAP, ROLE_MAP, PHASE_DURATIONS } from "../../constants";
import {
  DisplayRole, DisplayPhase, ChannelHeader,
} from "../miscellaneous/CustomComponents";

const GameTimer = () => {
  const { user, uDispatch, currentChannel, cDispatch } = useUserState();
  const { _id: channelId, channel, phase } = currentChannel;
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

  const calcTimer = useCallback(() =>{
    const duration = PHASE_DURATIONS[currentPhase] * 1000;
    return new Date(changedAt).getTime() + duration;
  }, [currentPhase, changedAt]);

  useEffect(() => {
    fetchUserState();
    
    return () => uDispatch({ type: "LEAVE_GAME" });
  }, [fetchUserState, uDispatch]);

  useEffect(() => {
    if (gameSocketRef.current) return;

    const auth = { auth: { token: user.token } };
    gameSocketRef.current = io("http://localhost:5000/game", auth);

    gameSocketRef.current.on("connect", async () => {
      try {
        const { gameState } = await gameSocketRef.current.emitWithAck(
          "joinGame", channelId
        );

        if (!gameState) {
          showToast(errors.GAME_NOT_FOUND, "error");
          await joinChannel(channel);
        }
        
        cDispatch({ type: "UPDATE_GAME_STATE", payload: gameState });
        uDispatch({ type: "UPDATE_STATUS", payload: gameState });
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.CONNECTION_FAILED, "error"
        );
        gameSocketRef.current.disconnect();
      }
    });

    gameSocketRef.current.on(
      "updateGameState",
      (gameState) => {
        cDispatch({ type: "UPDATE_GAME_STATE", payload: gameState });
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
    user.token,
    channelId,
    channel,
    showToast,
    uDispatch,
    cDispatch,
    joinChannel,
  ]);

  return (
    <ChannelHeader>
      <Box display="flex">
        <DisplayPhase mr={2}>
          {currentDay}日目
        </DisplayPhase>
        <DisplayPhase>
          {PHASE_MAP[currentPhase || "pre"]}
        </DisplayPhase>
      </Box>

      {currentPhase && changedAt &&
        <Countdown
          date={calcTimer()}
          renderer={({ minutes, seconds }) => (minutes * 60 + seconds)} 
        />
      }
      <DisplayRole status={user.status}>
        {ROLE_MAP[user.role || "spectator"]}
      </DisplayRole>
    </ChannelHeader>
  );
};

export default GameTimer;
