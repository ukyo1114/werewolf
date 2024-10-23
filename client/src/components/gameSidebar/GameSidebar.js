import React, { useState, useCallback, useEffect } from "react";
import { Box, Tooltip, Button, Text, useDisclosure } from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import { useUserState } from "../../context/userProvider";
import UserList from "../miscellaneous/UserList";
import VoteModal from "./VoteModal";
import VoteHistoryTabs from "./voteHistory/VoteHistory";
import ModalTemplete from "../miscellaneous/ModalTemplete";

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
    <Box
      display="flex"
      flexDirection="column"
      alignItems={{ base: 'center', lg: 'flex-start' }}
      width="100%"
    >
      <Tooltip label="ユーザーリスト" placement="bottom-end">
        <Button variant="ghost" my={2} onClick={userList.onOpen}>
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            ユーザーリスト
          </Text>
        </Button>
      </Tooltip>

      <ModalTemplete
        isOpen={userList.isOpen}
        onClose={userList.onClose}
        title={"ユーザーリスト"}
      >
        <UserList userList={currentChannel.users} />
      </ModalTemplete>

      <Tooltip label="投票" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("vote")}
          isDisabled={
            gameState.phase?.currentPhase !== "day" ||
            user.status !== "alive"
          }
        >
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            投票
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="占い" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("fortune")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "seer"
          }
        >
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            占い
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="護衛" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => handleVoteModalOpen("guard")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "hunter"
          }
        >
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            護衛
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="襲撃" placement="bottom-end">
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
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            襲撃
          </Text>
        </Button>
      </Tooltip>

      {
        gameState.phase && (() => {
          // JSXの外で変数を定義
          const titleSet = {
            vote: "投票先を選択",
            fortune: "占い先を選択",
            guard: "護衛先を選択",
            attack: "襲撃先を選択",
          };

          // JSXの返却
          return (
            <ModalTemplete
              isOpen={voteModal.isOpen}
              onClose={voteModal.onClose}
              title={titleSet[mode]}
            >
              <VoteModal mode={mode} onClose={voteModal.onClose} />
            </ModalTemplete>
          );
        })()
      }
      
      <Tooltip label="投票履歴" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={vHistoryModal.onOpen}
          isDisabled={
            gameState.phase && gameState.phase.currentPhase === "pre"
          }
        >
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            投票履歴
          </Text>
        </Button>
      </Tooltip>

      <ModalTemplete
        isOpen={vHistoryModal.isOpen}
        onClose={vHistoryModal.onClose}
      >
        <VoteHistoryTabs mode={voteHistoryModalMode} />
      </ModalTemplete>
    </Box>
  );
};

export default GameSidebar;
