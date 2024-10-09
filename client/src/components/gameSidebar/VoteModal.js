import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Image,
  Flex,
} from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/userProvider";
import axios from "axios";
import useNotification from "../../hooks/notification";

const VoteModal = ({ isOpen, onClose, mode }) => {
  const { user, currentChannel, gameState } = useUserState();
  const [title, setTitle] = useState("");
  const [button, setButton] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOnClose = useCallback(() => {
    setSelectedUser();
    onClose();
  }, [setSelectedUser, onClose]);

  useEffect(() => {
    handleOnClose();
  }, [handleOnClose, gameState.phase]);

  useEffect(() => {
    const titleSet = {
      vote: "投票先を選択",
      fortune: "占い先を選択",
      guard: "護衛先を選択",
      attack: "襲撃先を選択",
    };
    setTitle(titleSet[mode]);
  }, [gameState?.phase, setTitle, mode]);

  useEffect(() => {
    const buttons = {
      vote: (
        <VoteButton selectedUser={selectedUser} handleOnClose={handleOnClose} />
      ),
      fortune: (
        <FortuneButton
          selectedUser={selectedUser}
          handleOnClose={handleOnClose}
        />
      ),
      guard: (
        <GuardButton
          selectedUser={selectedUser}
          handleOnClose={handleOnClose}
        />
      ),
      attack: (
        <AttackButton
          selectedUser={selectedUser}
          handleOnClose={handleOnClose}
        />
      ),
    };
    setButton(buttons[mode]);
  }, [selectedUser, handleOnClose, gameState?.phase, setButton, mode]);

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <Box
            display="flex"
            flexDir="column"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
          >
            {currentChannel.users.map((u) => (
              <Box
                key={u._id}
                display="flex"
                alignItems="center"
                mb={3}
                p={3}
                borderRadius="md"
                bg={selectedUser === u._id ? "blue.100" : "white"}
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
                <Image
                  src={u.pic}
                  alt={u.name}
                  boxSize={16}
                  borderRadius="md"
                  mr={5}
                />
                <Text fontSize="lg">{u.name}</Text>
              </Box>
            ))}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Flex width="100%" justifyContent="space-evenly">
            <Button onClick={handleOnClose}>Close</Button>
            {button}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const VoteButton = ({ selectedUser, handleOnClose }) => {
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
        showToast(error?.response?.data?.message || "投票に失敗しました", "error");
      } finally{
        handleOnClose();
      }
    } else {
      showToast("投票先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, handleOnClose]);

  return (
    <Button
      colorScheme="twitter"
      onClick={handleSubmit}
      isDisabled={!selectedUser}
    >
      投票
    </Button>
  );
};

const FortuneButton = ({ selectedUser, handleOnClose }) => {
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
        showToast(error?.response?.data?.message || "送信に失敗しました", "error");
      } finally {
        handleOnClose();
      }
    } else {
      showToast("占い先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, handleOnClose]);

  return (
    <Button
      colorScheme="twitter"
      onClick={handleSubmit}
      isDisabled={!selectedUser}
    >
      占う
    </Button>
  );
};

const GuardButton = ({ selectedUser, handleOnClose }) => {
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
        showToast(error?.response?.data?.message || "送信に失敗しました", "error");
      } finally {
        handleOnClose();
      }
    } else {
      showToast("護衛先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, handleOnClose]);

  return (
    <Button
      colorScheme="twitter"
      onClick={handleSubmit}
      isDisabled={!selectedUser}
    >
      護衛する
    </Button>
  );
};

const AttackButton = ({ selectedUser, handleOnClose }) => {
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
        showToast(error?.response?.data?.message || "送信に失敗しました", "error");
      } finally {
        handleOnClose();
      }
    } else {
      showToast("襲撃先が選択されていません", "warning");
    }
  }, [selectedUser, user.token, gameState.gameId, showToast, handleOnClose]);

  return (
    <Button
      colorScheme="twitter"
      onClick={handleSubmit}
      isDisabled={!selectedUser}
    >
      襲撃する
    </Button>
  );
};

export default VoteModal;
