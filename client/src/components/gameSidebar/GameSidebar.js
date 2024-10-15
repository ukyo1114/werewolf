import React, { useState, useCallback, useEffect } from "react";
import { Box, Tooltip, Button, Text, useDisclosure } from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import { useUserState } from "../../context/userProvider";
import UserList from "../miscellaneous/UserList";
import VoteModal from "./VoteModal";
import VoteHistoryModal from "./VoteHistoryModal";

const GameSidebar = () => {
  const { user, currentChannel, gameState } = useUserState();
  const userList = useDisclosure();
  const voteModal = useDisclosure();
  const vHistoryModal = useDisclosure();

  const [mode, setMode] = useState("");
  const [voteHistoryModalMode, setVoteHistoryModalMode] = useState("");

  const handleVoteModalOpen = useCallback(
    (str) => {
      setMode(str);
      voteModal.onOpen();
    },
    [setMode, voteModal],
  );

  useEffect(() => {
    const modeSet = {
      seer: "fortune",
      medium: "medium",
      hunter: "guard",
      werewolf: "attack",
    };
    setVoteHistoryModalMode(modeSet[user.role] || "others");
  }, [setVoteHistoryModalMode, user.role]);

  return (
    <Box display="flex" flexDirection="column">
      <Tooltip label="ユーザーリスト" hasArrow placement="bottom-end">
        <Button variant="ghost" my={2} onClick={userList.onOpen}>
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            ユーザーリスト
          </Text>
        </Button>
      </Tooltip>

      <UserList
        isOpen={userList.isOpen}
        onClose={userList.onClose}
        userList={currentChannel.users}
      />

      <Tooltip label="投票" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("vote")}
          isDisabled={
            gameState.phase?.currentPhase !== "day" ||
            user.status !== "alive"
          }
        >
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            投票
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="占い" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("fortune")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" ||
            user.role !== "seer"
          }
        >
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            占い
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="護衛" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("guard")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" ||
            user.role !== "hunter"
          }
        >
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            護衛
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="襲撃" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("attack")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" ||
            user.role !== "werewolf"
          }
        >
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            襲撃
          </Text>
        </Button>
      </Tooltip>
      {gameState.phase && (
        <VoteModal
          isOpen={voteModal.isOpen}
          onClose={voteModal.onClose}
          mode={mode}
        />
      )}
      
      <Tooltip label="投票履歴" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={vHistoryModal.onOpen}
          isDisabled={
            gameState.phase && gameState.phase.currentPhase === "pre"
          }
        >
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            投票履歴
          </Text>
        </Button>
      </Tooltip>
      <VoteHistoryModal
        isOpen={vHistoryModal.isOpen}
        onClose={vHistoryModal.onClose}
        mode={voteHistoryModalMode}
      />
    </Box>
  );
};

export default GameSidebar;
