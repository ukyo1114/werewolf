import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import { Stack } from "@chakra-ui/react";

import { useUserState } from "../../context/UserProvider.jsx";
import useNotification from "../../hooks/useNotification";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";

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
    <Stack w="100%" overflow="hidden">
      <Stack w="100%" p={2} gap={4} overflow="auto">
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
      </Stack> 
      {button}
    </Stack>
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
          { gameId: channelId, selectedUser },
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
    <ModalButton onClick={handleSubmit} isDisabled={!selectedUser}>
      投票
    </ModalButton>
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
          { gameId: channelId, selectedUser },
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
    <ModalButton onClick={handleSubmit} isDisabled={!selectedUser}>
      占う
    </ModalButton>
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
          { gameId: channelId, selectedUser },
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
    <ModalButton onClick={handleSubmit} isDisabled={!selectedUser}>
      護衛する
    </ModalButton>
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
          { gameId: channelId, selectedUser },
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
    <ModalButton onClick={handleSubmit} isDisabled={!selectedUser}>
      襲撃する
    </ModalButton>
  );
};

export default VoteModal;
