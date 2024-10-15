import React from "react";
import {
  Box,
  Tooltip,
  Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
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
    <Box display="flex" flexDirection="column">
      <Tooltip label="ユーザーリスト" hasArrow placement="bottom-end">
        <Button variant="ghost" my={2} onClick={userListModal.onOpen}>
          <FaUsers size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            ユーザーリスト
          </Text>
        </Button>
      </Tooltip>

      {currentChannel && (
        <UserList
          isOpen={userListModal.isOpen}
          onClose={userListModal.onClose}
          userList={currentChannel.users}
        />
      )}

      <Tooltip label="観戦" hasArrow placement="bottom-end">
        <Button variant="ghost" my={2}>
          <FaBinoculars size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            観戦
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="チャンネル一覧" hasArrow placement="bottom-end">
        <Button variant="ghost" my={2} onClick={() => setCurrentChannel()}>
          <FaArrowLeft size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネル一覧
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="チャンネルを抜ける" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => leaveChannel()}
          isDisabled={isAdmin}
        >
          <FaSignOutAlt size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネルを抜ける
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="ブロック" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={blockModal.onOpen}
          isDisabled={!isAdmin}
        >
          <FaUserSlash size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            ブロック
          </Text>
        </Button>
      </Tooltip>

      {currentChannel && isAdmin && (
        <BlockModal isOpen={blockModal.isOpen} onClose={blockModal.onClose} />
      )}

      <Tooltip label="チャンネル設定" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={chSettingsModal.onOpen}
          isDisabled={!isAdmin}>
          <FaCog size="30px" />
          <Text display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネル設定
          </Text>
        </Button>
      </Tooltip>

      {currentChannel && isAdmin && (
        <ChannelSettingsModal
          isOpen={chSettingsModal.isOpen}
          onClose={chSettingsModal.onClose}
        />
      )}
    </Box>
  );
};

export default ChannelSidebar;
