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
import { useUserState } from "../../context/userProvider";
import UserList from "../miscellaneous/UserList";
import BlockModal from "./BlockModal";
import ChannelSettingsModal from "./ChannelSettingsModal"
import axios from "axios";
import useNotification from "../../hooks/notification";
import ModalTemplete from "../miscellaneous/ModalTemplete";
import {
  SidebarBox,
  SidebarButton,
  iconProps,
} from "../miscellaneous/CustomComponents";

const ChannelSidebar = () => {
  const { user, currentChannel, setCurrentChannel } = useUserState();
  const isAdmin = currentChannel.channelAdmin === user._id;
  const showToast = useNotification();

  const userListModal = useDisclosure();
  const blockModal = useDisclosure();
  const chSettingsModal = useDisclosure();

  const leaveChannel = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.put(
        `/api/channel/leave`,
        { channelId: currentChannel._id },
        config,
      );

      showToast(data.message, "success");
      setCurrentChannel();
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

        <SidebarButton label="観戦">
          <FaBinoculars {...iconProps} />
        </SidebarButton>

        <SidebarButton label="チャンネル一覧" onClick={() => setCurrentChannel()}>
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
        <UserList userList={currentChannel.users} />
      </ModalTemplete>

      {currentChannel && isAdmin && (
        <ModalTemplete isOpen={blockModal.isOpen} onClose={blockModal.onClose}>
          <BlockModal />
        </ModalTemplete>
      )}

      {currentChannel && isAdmin && (
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
