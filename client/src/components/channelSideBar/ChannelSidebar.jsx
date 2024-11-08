import React from "react";
import { useDisclosure } from "@chakra-ui/react";
import {
  FaUsers,
  FaBinoculars,
  FaArrowLeft,
  FaSignOutAlt,
  FaCog,
  FaUserSlash,
} from "react-icons/fa";
import { useUserState } from "../../context/userProvider.jsx";
import UserList from "../miscellaneous/UserList.jsx";
import BlockModal from "./BlockModal.jsx";
import ChannelSettingsModal from "./ChannelSettingsModal.jsx"
import axios from "axios";
import useNotification from "../../hooks/notification";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import {
  SidebarBox,
  SidebarButton,
  iconProps,
} from "../miscellaneous/CustomComponents.jsx";
import SpectatorModal from "./spectate/SpectatorModal.jsx";

const ChannelSidebar = () => {
  const { user, currentChannel, cDispatch } = useUserState();
  const { _id: channelId, channelAdmin, users } = currentChannel;
  const isAdmin = channelAdmin === user._id;
  const showToast = useNotification();

  const userListModal = useDisclosure();
  const blockModal = useDisclosure();
  const chSettingsModal = useDisclosure();
  const spectator = useDisclosure();

  const leaveChannel = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        `/api/channel/leave`, { channelId }, config,
      );

      showToast(data.message, "success");
      cDispatch({ type: "LEAVE_CHANNEL"});
    } catch (error) {
      showToast(error?.response?.data?.error, "error");
    }
  };

  return (
    <>
      <SidebarBox>
        <SidebarButton label="ユーザーリスト" onClick={userListModal.onOpen}>
          <FaUsers {...iconProps} />
        </SidebarButton>

        <SidebarButton label="観戦" onClick={spectator.onOpen}>
          <FaBinoculars {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="チャンネル一覧"
          onClick={() => cDispatch({ type: "LEAVE_CHANNEL"})}
        >
          <FaArrowLeft {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="チャンネルを抜ける"
          onClick={() => leaveChannel()}
          isDisabled={isAdmin}
        >
          <FaSignOutAlt {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="ブロック"
          onClick={blockModal.onOpen}
          isDisabled={!isAdmin}
        >
          <FaUserSlash {...iconProps} />
        </SidebarButton>

        <SidebarButton
          label="チャンネル設定"
          onClick={chSettingsModal.onOpen}
          isDisabled={!isAdmin}
        >
          <FaCog {...iconProps} />
        </SidebarButton>
      </SidebarBox>
      
      <ModalTemplete
        isOpen={userListModal.isOpen}
        onClose={userListModal.onClose}
        title={"ユーザーリスト"}
      >
        <UserList userList={users} />
      </ModalTemplete>

      <ModalTemplete
        isOpen={spectator.isOpen}
        onClose={spectator.onClose}
        title={"ゲームリスト"}
      >
        <SpectatorModal />
      </ModalTemplete>

      {isAdmin && (
        <ModalTemplete isOpen={blockModal.isOpen} onClose={blockModal.onClose}>
          <BlockModal />
        </ModalTemplete>
      )}

      {isAdmin && (
        <ModalTemplete
          isOpen={chSettingsModal.isOpen}
          onClose={chSettingsModal.onClose}
          title={"チャンネル設定"}
        >
          <ChannelSettingsModal />
        </ModalTemplete>
      )}
    </>
  );
};

export default ChannelSidebar;
