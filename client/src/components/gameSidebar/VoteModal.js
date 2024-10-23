import React, { useState, useEffect, useCallback } from "react";
import { Box, ModalBody } from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/userProvider";
import axios from "axios";
import useNotification from "../../hooks/notification";
import DisplayUser from "../miscellaneous/DisplayUser";
import ModalButton from "../miscellaneous/ModalButton";

const VoteModal = ({ mode, onClose }) => {
  const { user, currentChannel, gameState } = useUserState();
  const [button, setButton] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
/* 
  const handleOnClose = useCallback(() => {
    setSelectedUser();
    onClose();
  }, [setSelectedUser, onClose]); */
/* 
  useEffect(() => {
    handleOnClose();
  }, [handleOnClose, gameState.phase]); */

  useEffect(() => {
    const buttons = {
      vote: (<VoteButton selectedUser={selectedUser} onClose={onClose} />),
      fortune: (<FortuneButton selectedUser={selectedUser} onClose={onClose} />),
      guard: (<GuardButton selectedUser={selectedUser} onClose={onClose} />),
      attack: (<AttackButton selectedUser={selectedUser} onClose={onClose} />),
    };
    setButton(buttons[mode]);
  }, [selectedUser, onClose, gameState?.phase, setButton, mode]);

  return (
    <ModalBody>
      <Box display="flex" flexDir="column" p={3} maxHeight="800px" overflowY="auto">
        {gameState.users.map((u) => (
          <Box
            key={u._id}
            display="flex"
            alignItems="center"
            mb={3}
            p={3}
            borderRadius="md"
            borderWidth={2}
            borderColor={selectedUser === u._id ? "white" : "#E17875"}
            bg={selectedUser === u._id ? "#E17875" : "#2B2024"}
            _hover={{
              bg: selectedUser !== u._id ? "#3B2C2F" : undefined,
            }}
            cursor="pointer"
            onClick={() => setSelectedUser(u._id)}
            pointerEvents={
              u._id !== user._id &&
              u.status === "alive" &&
              (gameState.phase.currentPhase !== "night" ||
                u._id !== user.partnerId)
                ? "auto"
                : "none"
            }
            opacity={
              u._id !== user._id &&
              u.status === "alive" &&
              (gameState.phase.currentPhase !== "night" ||
                u._id !== user.partnerId)
                ? "1"
                : "0.6"
            }
          >
            <DisplayUser user={
              currentChannel.users.find((user) => user._id === u._id)
            } />
          </Box>
        ))}
      </Box>

      {button}
    </ModalBody>
  );
};

const VoteButton = ({ selectedUser, onClose }) => {
  const { user, gameState } = useUserState();
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        await axios.post(
          "/api/game/vote",
          {
            gameId: gameState.gameId,
            selectedUser: selectedUser,
          },
          config,
        );
        showToast("投票しました", "success");
      } catch (error) {
        showToast(error?.response?.data?.error || "投票に失敗しました", "error");
      } finally {
        onClose();
      }
    } else {
      showToast("投票先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"投票"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

const FortuneButton = ({ selectedUser, onClose }) => {
  const { user, gameState } = useUserState();
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        await axios.post(
          "/api/game/fortune",
          {
            gameId: gameState.gameId,
            selectedUser: selectedUser,
          },
          config,
        );
        showToast("送信しました", "success");
      } catch (error) {
        showToast(error?.response?.data?.error || "送信に失敗しました", "error");
      } finally {
        onClose();
      }
    } else {
      showToast("占い先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"占う"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

const GuardButton = ({ selectedUser, onClose }) => {
  const { user, gameState } = useUserState();
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        await axios.post(
          "/api/game/guard",
          {
            gameId: gameState.gameId,
            selectedUser: selectedUser,
          },
          config,
        );
        showToast("送信しました", "success");
      } catch (error) {
        showToast(error?.response?.data?.error || "送信に失敗しました", "error");
      } finally {
        onClose();
      }
    } else {
      showToast("護衛先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"護衛する"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

const AttackButton = ({ selectedUser, onClose }) => {
  const { user, gameState } = useUserState();
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        await axios.post(
          "/api/game/attack",
          {
            gameId: gameState.gameId,
            selectedUser: selectedUser,
          },
          config,
        );
        showToast("送信しました", "success");
      } catch (error) {
        showToast(error?.response?.data?.error || "送信に失敗しました", "error");
      } finally {
        onClose();
      }
    } else {
      showToast("襲撃先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"襲撃する"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

export default VoteModal;
