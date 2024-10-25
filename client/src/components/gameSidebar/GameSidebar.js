import React, { useState, useCallback, useEffect } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { FaUsers, FaArrowLeft } from "react-icons/fa";
import { useUserState } from "../../context/userProvider";
import UserList from "../miscellaneous/UserList";
import VoteModal from "./VoteModal";
import VoteHistoryTabs from "./voteHistory/VoteHistory";
import ModalTemplete from "../miscellaneous/ModalTemplete";
import {
  SidebarBox,
  SidebarButton,
  iconProps,
} from "../miscellaneous/CustomComponents";
import { TITLE_MAP, MODE_MAP } from "../../constants";
import { useEnterToChannel } from "../../hooks/useEnterToChannel";

const GameSidebar = () => {
  const { user, currentChannel, gameState, setGameState } = useUserState();
  const userList = useDisclosure();
  const voteModal = useDisclosure();
  const vHistoryModal = useDisclosure();

  const [mode, setMode] = useState("");
  const [voteHistoryModalMode, setVoteHistoryModalMode] = useState("");

  const enterToChannel = useEnterToChannel();

  const handleVoteModalOpen = useCallback((str) => {
    setMode(str);
    voteModal.onOpen();
  }, [setMode, voteModal]);

  const backToChannel = useCallback(async () => {
    await enterToChannel(currentChannel.channel);
    setGameState(null);
  }, [currentChannel.channel, enterToChannel, setGameState]);

  useEffect(() => {
    setVoteHistoryModalMode(MODE_MAP[user.role] || "others");
  }, [setVoteHistoryModalMode, user.role]);

  return (
    <>
      <SidebarBox>
        <SidebarButton label="ユーザーリスト" onClick={userList.onOpen}>
          <FaUsers {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="投票"
          onClick={() => handleVoteModalOpen("vote")}
          isDisabled={
            gameState.phase?.currentPhase !== "day" ||
            user.status !== "alive"
          }
        >
          <FaUsers {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="占い"
          onClick={() => handleVoteModalOpen("fortune")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "seer"
          }
        >
          <FaUsers {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="護衛"
          onClick={() => handleVoteModalOpen("guard")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "hunter"
          }
        >
          <FaUsers {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="襲撃"
          onClick={() => handleVoteModalOpen("attack")}
          isDisabled={
            gameState.phase?.currentPhase !== "night" ||
            user.status !== "alive" ||
            user.role !== "werewolf"
          }
        >
          <FaUsers {...iconProps} />
        </SidebarButton>


        
        <SidebarButton
          label="投票履歴"
          onClick={vHistoryModal.onOpen}
          isDisabled={
            gameState.phase && gameState.phase.currentPhase === "pre"
          }
        >
          <FaUsers {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="チャンネルへ戻る"
          onClick={backToChannel}
          isDisabled={
            gameState.phase?.currentPhase !== "finished" &&
            user.status === "alive"
          }
        >
          <FaArrowLeft {...iconProps} />
        </SidebarButton>
      </SidebarBox>

      <ModalTemplete
        isOpen={userList.isOpen}
        onClose={userList.onClose}
        title={"ユーザーリスト"}
      >
        <UserList userList={currentChannel.users}/>
      </ModalTemplete>

      <ModalTemplete
        isOpen={vHistoryModal.isOpen}
        onClose={vHistoryModal.onClose}
      >
        <VoteHistoryTabs mode={voteHistoryModalMode} />
      </ModalTemplete>
      
      {gameState.phase && (
        <ModalTemplete
          isOpen={voteModal.isOpen}
          onClose={voteModal.onClose}
          title={TITLE_MAP[mode]}
        >
          <VoteModal mode={mode} onClose={voteModal.onClose} />
        </ModalTemplete>
      )}
    </>
  );
};

export default GameSidebar;
