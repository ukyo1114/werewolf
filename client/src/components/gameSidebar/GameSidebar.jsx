import React, { useState, useCallback } from "react";
import { useDisclosure } from "@chakra-ui/react";
import { FaUsers, FaVoteYea, FaShieldAlt, FaFileAlt, FaArrowLeft } from "react-icons/fa";
import { GiCrystalBall, GiWolfHowl } from 'react-icons/gi';
import { useUserState } from "../../context/UserProvider.jsx";
import UserList from "../miscellaneous/UserList.jsx";
import VoteModal from "./VoteModal.jsx";
import VoteHistoryTabs from "./voteHistory/VoteHistory.jsx";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import {
  SidebarBox,
  SidebarButton,
  iconProps,
} from "../miscellaneous/CustomComponents.jsx";
import { TITLE_MAP, MODE_MAP } from "../../constants";
import { useJoinChannel } from "../../hooks/useJoinChannel";

const GameSidebar = () => {
  const { user, currentChannel } = useUserState();
  const { channel, users, phase } = currentChannel;
  const userList = useDisclosure();
  const voteModal = useDisclosure();
  const vHistoryModal = useDisclosure();
  const [mode, setMode] = useState("");
  const joinChannel = useJoinChannel();

  const handleVoteModalOpen = useCallback((str) => {
    setMode(str);
    voteModal.onOpen();
  }, [setMode, voteModal]);

  const backToChannel = useCallback(async () => {
    await joinChannel(channel);
  }, [channel, joinChannel]);

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
            phase.currentPhase !== "day" ||
            user.status !== "alive"
          }
        >
          <FaVoteYea {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="占い"
          onClick={() => handleVoteModalOpen("fortune")}
          isDisabled={
            phase.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "seer"
          }
        >
          <GiCrystalBall {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="護衛"
          onClick={() => handleVoteModalOpen("guard")}
          isDisabled={
            phase.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "hunter"
          }
        >
          <FaShieldAlt {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="襲撃"
          onClick={() => handleVoteModalOpen("attack")}
          isDisabled={
            phase.currentPhase !== "night" ||
            user.status !== "alive" || user.role !== "werewolf"
          }
        >
          <GiWolfHowl {...iconProps} />
        </SidebarButton>
        
        <SidebarButton
          label="投票履歴"
          onClick={vHistoryModal.onOpen}
          isDisabled={phase.currentPhase === "pre"}
        >
          <FaFileAlt {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="チャンネルへ戻る"
          onClick={backToChannel}
          isDisabled={
            phase.currentPhase !== "finished" &&
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
        <UserList userList={users}/>
      </ModalTemplete>

      <ModalTemplete
        isOpen={vHistoryModal.isOpen}
        onClose={vHistoryModal.onClose}
      >
        <VoteHistoryTabs mode={MODE_MAP[user.role] || "others"} />
      </ModalTemplete>

      <ModalTemplete
        isOpen={voteModal.isOpen}
        onClose={voteModal.onClose}
        title={TITLE_MAP[mode]}
      >
        <VoteModal mode={mode} onClose={voteModal.onClose} />
      </ModalTemplete>
    </>
  );
};

export default GameSidebar;