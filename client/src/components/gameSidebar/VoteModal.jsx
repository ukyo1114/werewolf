import React, { useState, useEffect, useCallback } from "react";
import { Box, ModalBody } from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import axios from "axios";
import useNotification from "../../hooks/useNotification";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";
import { SelectableBox } from "../miscellaneous/CustomComponents.jsx";

const VoteModal = ({ mode, onClose }) => {
  const { user, currentChannel } = useUserState();
  const { users, phase } = currentChannel;
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
  }, [selectedUser, onClose, phase, setButton, mode]);

  return (
    <ModalBody>
      <Box display="flex" flexDir="column" gap={4} p={3} maxH="60vh" overflowY="auto">
        {users.map((u) => {
          const hidden =
            u._id === user._id ||
            u.status !== "alive" ||
            (phase.currentPhase === "night" && u._id === user.partnerId);
          if (hidden) return null;
          
          return (
            <DisplayUser
              key={u._id}
              user={u}
              cursor="pointer"
              onClick={() => setSelectedUser(u._id)}
              bg={selectedUser === u._id ? "green.100" : "white"}
              _hover={{
                bg: selectedUser !== u._id ? "gray.200" : undefined,
              }}
            />
          )
        })}
      </Box>

      {button}
    </ModalBody>
  );
};

const VoteButton = ({ selectedUser, onClose }) => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId } = currentChannel;
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        await axios.post(
          "/api/game/vote",
          { gameId: channelId, selectedUser: selectedUser },
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
  }, [selectedUser, user.token, channelId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"投票"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

const FortuneButton = ({ selectedUser, onClose }) => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId } = currentChannel;
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        await axios.post(
          "/api/game/fortune",
          { gameId: channelId, selectedUser: selectedUser },
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
  }, [selectedUser, user.token, channelId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"占う"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

const GuardButton = ({ selectedUser, onClose }) => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId } = currentChannel;
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        await axios.post(
          "/api/game/guard",
          { gameId: channelId, selectedUser: selectedUser },
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
  }, [selectedUser, user.token, channelId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"護衛する"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

const AttackButton = ({ selectedUser, onClose }) => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId } = currentChannel;
  const showToast = useNotification();

  const handleSubmit = useCallback(async () => {
    if (selectedUser) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        await axios.post(
          "/api/game/attack",
          { gameId: channelId, selectedUser: selectedUser },
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
  }, [selectedUser, user.token, channelId, showToast, onClose]);

  return (
    <ModalButton
      innerText={"襲撃する"}
      onClick={handleSubmit}
      disableCondition={!selectedUser}
    />
  );
};

export default VoteModal;
