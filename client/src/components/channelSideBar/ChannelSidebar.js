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
import ModalTemplete from "../miscellaneous/ModalTemplete";

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
    <Box
      display="flex"
      flexDirection="column"
      alignItems={{ base: 'center', lg: 'flex-start' }}
      width="100%"
    >
      <Tooltip label="ユーザーリスト" placement="bottom-end">
        <Button variant="ghost" my={2} onClick={userListModal.onOpen}>
          <FaUsers size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            ユーザーリスト
          </Text>
        </Button>
      </Tooltip>

      {currentChannel && (
        <ModalTemplete
          isOpen={userListModal.isOpen}
          onClose={userListModal.onClose}
          title={"ユーザーリスト"}
          Contents={UserList}
          contentsProps={{ userList: currentChannel.users }}
        />
      )}

      <Tooltip label="観戦" placement="bottom-end">
        <Button variant="ghost" my={2}>
          <FaBinoculars size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            観戦
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="チャンネル一覧" placement="bottom-end">
        <Button variant="ghost" my={2} onClick={() => setCurrentChannel()}>
          <FaArrowLeft size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネル一覧
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="チャンネルを抜ける" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={() => leaveChannel()}
          isDisabled={isAdmin}
        >
          <FaSignOutAlt size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネルを抜ける
          </Text>
        </Button>
      </Tooltip>

      <Tooltip label="ブロック" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={blockModal.onOpen}
          isDisabled={!isAdmin}
        >
          <FaUserSlash size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            ブロック
          </Text>
        </Button>
      </Tooltip>

      {currentChannel && isAdmin && (
        <ModalTemplete
          isOpen={blockModal.isOpen}
          onClose={blockModal.onClose}
          Contents={BlockModal}
        />
      )}

      <Tooltip label="チャンネル設定" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={chSettingsModal.onOpen}
          isDisabled={!isAdmin}>
          <FaCog size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネル設定
          </Text>
        </Button>
      </Tooltip>

      {currentChannel && isAdmin && (
        <ModalTemplete
          isOpen={chSettingsModal.isOpen}
          onClose={chSettingsModal.onClose}
          title={"チャンネル設定"}
          Contents={ChannelSettingsModal}
        />
      )}
    </Box>
  );
};

export default ChannelSidebar;
