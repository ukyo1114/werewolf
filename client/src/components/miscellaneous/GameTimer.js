import React, { useState, useCallback, useEffect } from "react";
import { useToast, Box, HStack, Text } from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import axios from "axios";
import "../styles.css";
import io from "socket.io-client";
let gameSocket;

const GameTimer = () => {
  const { user, setUser, gameState, setGameState } = useUserState();
  const [currentPhase, setCurrentPhase] = useState("");
  const [time, setTime] = useState(null);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const toast = useToast();

  const fetchUserState = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `/api/game/player-state/${gameState.gameId}`,
        config,
      );
      setUser((prevUser) => ({ ...prevUser, ...data }));
    } catch (error) {
      toast({
        title: "Error !",
        description: "プレイヤー状態の読み込みに失敗しました。",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [toast, user.token, gameState.gameId, setUser]);

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
    gameSocket = io("http://localhost:5000/game", {
      auth: {
        token: user.token,
      },
    });

    gameSocket.on("connect", async () => {
      try {
        const response = await gameSocket.emitWithAck(
          "joinGame",
          gameState.gameId,
        );
        if (response.gameState) {
          setGameState((prevCurrentGame) => ({
            ...prevCurrentGame,
            phase: response.gameState.phase,
            users: response.gameState.users,
          }));
        } else {
          toast({
            title: "Error !",
            description: "ゲームが見つかりませんでした。",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setGameState(null); // 元のチャンネルに戻る処理を追加
        }
      } catch (error) {
        toast({
          title: "Error !",
          description: "接続に失敗しました。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        gameSocket.disconnect();
      }
    });

    gameSocket.on("updateGameState", (gameState) => {
      setGameState(gameState);
    });
    
    gameSocket.on("connect_error", (err) => {
      toast({
        title: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    });

    return () => {
      gameSocket.disconnect();
    };
  }, [user.token, gameState.gameId, toast, setGameState]);

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
            setGameState(); // 元のチャンネルに戻る処理を追加
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
