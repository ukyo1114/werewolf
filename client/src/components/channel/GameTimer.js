import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import axios from "axios";
import "../styles.css";
import io from "socket.io-client";
import useNotification from "../../hooks/notification";
import { errors } from "../../messages";
import {
  PHASE_MAP,
  ROLE_MAP,
  PHASE_DURATIONS,
} from "../../constants";
import { TimerAndRole, DisplayPhase, ChannelHeader } from "../miscellaneous/CustomComponents";

const GameTimer = () => {
  const { user, setUser, setCurrentChannel, gameState, setGameState } = useUserState();
  const [currentPhase, setCurrentPhase] = useState("");
  const [time, setTime] = useState(null);
  const [role, setRole] = useState("");
  const showToast = useNotification();
  const gameSocketRef = useRef(null);

  const fetchUserState = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get(
        `/api/game/player-state/${gameState.gameId}`, config
      );
      setUser((prevUser) => ({ ...prevUser, ...data }));
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.PLAYER_LOAD_FAILED, "error"
      );
    }
  }, [showToast, user.token, gameState.gameId, setUser]);

  useEffect(() => {
    fetchUserState();
    
    return () => {
      setUser((prevUser) => {
        const { status, role, partnerId, ...remainingUser } = prevUser;
        return remainingUser;
      });
    };
  }, [fetchUserState, setUser, gameState.phase]);

  useEffect(() => {
    if (gameSocketRef.current) return;

    const auth = { auth: { token: user.token } };
    gameSocketRef.current = io("http://localhost:5000/game", auth);

    gameSocketRef.current.on("connect", async () => {
      try {
        const gameId = gameState.gameId;
        const response = await gameSocketRef.current.emitWithAck("joinGame", gameId);

        if (!response.gameState) {
          showToast(errors.GAME_NOT_FOUND, "error");
          setGameState(null); // 元のチャンネルに戻る処理を追加
        }

        updateGameState(response.gameState)
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.CONNECTION_FAILED, "error"
        );
        gameSocketRef.current.disconnect();
      }
    });

    gameSocketRef.current.on("updateGameState", (gameState) => updateGameState(gameState));
    
    gameSocketRef.current.on("connect_error", (err) => showToast(err.message, "error"));

    function updateGameState(gameState) {
      setGameState(gameState);
      setCurrentChannel((prevCurrentChannel) => {
        const usersAddStatus = prevCurrentChannel.users.map((user) => {
          const userFromGameState = gameState.users.find((u) => 
            u._id === user._id
          );
          if (!userFromGameState) return user;
          return { ...user, ...userFromGameState };
        });

        return { ...prevCurrentChannel, users: usersAddStatus };
      });
    }

    return () => gameSocketRef.current.disconnect();
  }, [user.token, gameState.gameId, showToast, setCurrentChannel, setGameState]);

  useEffect(() => {
    if (!gameState.phase) return;

    const phase = PHASE_MAP[gameState.phase.currentPhase];
    setCurrentPhase(phase);
  }, [gameState.phase, setCurrentPhase]);

  useEffect(() => {
    if (!gameState.phase) return;
    
    console.log("gameState.phase:", gameState?.phase, "currentPhase", gameState?.phase?.currentPhase);

    const duration = PHASE_DURATIONS[gameState.phase.currentPhase];
    const elapsed = Math.floor(
      (new Date() - new Date(gameState.phase.changedAt)) / 1000,
    );
    let remaining = duration - elapsed;
    if (remaining < 0) remaining = 0;
    setTime(remaining);
    const intervalId = setInterval(() => {
      remaining--;
      setTime(remaining);
      if (remaining <= 0) {
        if (gameState.phase.currentPhase === "finished") {
          setGameState(null); // 元のチャンネルに戻る処理を追加
        }
        clearInterval(intervalId);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [gameState.phase, setTime, setGameState]);

  useEffect(() => {
    const role = ROLE_MAP[user.role] || "観戦者";
    setRole(role);
  }, [user.role, setRole]);

  return (
    <ChannelHeader>
      <Box display="flex">
        <DisplayPhase mr={2}>
          {gameState.phase && `${gameState.phase.currentDay}日目`}
        </DisplayPhase>

        <DisplayPhase>{currentPhase}</DisplayPhase>
      </Box>

      <TimerAndRole>{time}</TimerAndRole>

      <TimerAndRole status={user.status}>{role}</TimerAndRole>
    </ChannelHeader>
  );
};

export default GameTimer;
