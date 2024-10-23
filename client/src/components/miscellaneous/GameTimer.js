import React, { useState, useCallback, useEffect } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import axios from "axios";
import "../styles.css";
import io from "socket.io-client";
import useNotification from "../../hooks/notification";
import { errors } from "../../messages";
let gameSocket;

const GameTimer = () => {
  const { user, setUser, gameState, setGameState } = useUserState();
  const [currentPhase, setCurrentPhase] = useState("");
  const [time, setTime] = useState(null);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const showToast = useNotification();

  const fetchUserState = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get(
        `/api/game/player-state/${gameState.gameId}`,
        config,
      );
      setUser((prevUser) => ({ ...prevUser, ...data }));
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.PLAYER_LOAD_FAILED,
        "error"
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
    const auth = { auth: { token: user.token } };
    gameSocket = io("http://localhost:5000/game", auth);

    gameSocket.on("connect", async () => {
      try {
        const gameId = gameState.gameId;
        const response = await gameSocket.emitWithAck("joinGame", gameId);

        if (!response.gameState) {
          showToast(errors.GAME_NOT_FOUND, "error");
          setGameState(null); // 元のチャンネルに戻る処理を追加
        }

        const { phase, users } = response.gameState;

        setGameState((prevCurrentGame) => (
          { ...prevCurrentGame, phase, users }
        ));
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.CONNECTION_FAILED, "error"
        );
        gameSocket.disconnect();
      }
    });

    gameSocket.on("updateGameState", (gameState) => setGameState(gameState));
    
    gameSocket.on("connect_error", (err) => showToast(err.message, "error"));

    return () => gameSocket.disconnect();
  }, [user.token, gameState.gameId, showToast, setGameState]);

  useEffect(() => {
    if (gameState.phase) {
      const phaseList = {
        pre: "準備中",
        day: "昼",
        night: "夜",
        end: "終了",
      };
      const str = phaseList[gameState.phase.currentPhase];
      setCurrentPhase(str);
    }
  }, [gameState.phase, setCurrentPhase]);

  useEffect(() => {
    if (gameState.phase) {
      const durations = {
        pre: 30,
        day: 10 * 60,
        night: 3 * 60,
        end: 10 * 60,
      };
      const phaseTime = durations[gameState.phase.currentPhase];
      const elapsed = Math.floor(
        (new Date() - new Date(gameState.phase.changedAt)) / 1000,
      );
      let remaining = phaseTime - elapsed;
      if (remaining < 0) remaining = 0;
      setTime(remaining);
      const intervalId = setInterval(() => {
        remaining--;
        setTime(remaining);
        if (remaining <= 0) {
          if (gameState.phase.currentPhase === "end") {
            setGameState(null); // 元のチャンネルに戻る処理を追加
          }
          clearInterval(intervalId);
        }
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [gameState.phase, setTime, setGameState]);

  useEffect(() => {
    if (user.status) {
      const statuses = {
        alive: "生存",
        dead: "死亡",
      };
      const str = statuses[user.status];
      setStatus(str);
    }
  }, [user.status, setStatus]);

  useEffect(() => {
    if (user.role) {
      const roles = {
        villager: "村人",
        seer: "占い師",
        medium: "霊能者",
        hunter: "狩人",
        werewolf: "人狼",
        madman: "狂人",
      };
      const str = roles[user.role];
      setRole(str);
    }
  }, [user.role, setRole]);

  return (
    <Box>
      <HStack spacing={4}>
        <Text
          fontSize="lg"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          {gameState.phase && `${gameState.phase.currentDay}日目`}
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          {currentPhase}
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          {time}
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          {role}
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          display="flex"
          alignItems="center"
        >
          {status}
        </Text>
      </HStack>
    </Box>
  );
};

export default GameTimer;
