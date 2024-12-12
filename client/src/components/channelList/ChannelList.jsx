import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import { useUserState } from "../../context/UserProvider.jsx";
import {
  Box,
  Divider,
  Flex,
  Avatar,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

import { FaEllipsisH } from "react-icons/fa";

import ChatLoading from "../ChatLoading.jsx";
import ChannelInfo from "./ChannelInfo.jsx";
import useNotification from "../../hooks/useNotification";
import { errors } from "../../messages";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";

const ChannelList = ({ showJoinedCh }) => {
  const { user, isMobile } = useUserState();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const channelInfo = useDisclosure();
  const showToast = useNotification();

  const fetchChannelList = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data: { channelList } } = await axios.get(
        "/api/channel/list", config
      );
      channelList.sort((a, b) => b.users.length - a.users.length);
      setChannelList(channelList);
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.FETCH_CHANNEL_LIST, "error"
      );
    }
  }, [user.token, showToast]);

  useEffect(() => {
    fetchChannelList();
  }, [fetchChannelList]);

  const filteredChannelList = showJoinedCh
    ? channelList.filter((channel) => channel.users.some((u) => u === user._id))
    : channelList;

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    channelInfo.onOpen();
  };

  return (
    channelList ? (
      <Stack overflowY="auto" width="100%" p={4} gap={4}>
        {filteredChannelList.map((channel) => {
          if (!channel.channelAdmin) return null;

          return (
            <Box
              data-key={channel._id} // テスト用
              onClick={() => handleChannelSelect(channel)}
              cursor="pointer"
              bg={channel.users.includes(user._id) ? "green.100" : "white"}
              p={2}
              w="100%"
              borderRadius="lg"
              key={channel._id}
              _hover={{
                bg: channel.users.includes(user._id) ? "green.200" : "gray.200",
              }}
              boxShadow="uniform"
            >
              <Flex justify="space-between" align="center" width="100%" gap={2}>
                <Avatar
                  size={isMobile ? "md" : "lg"}
                  src={channel.channelAdmin.pic}
                  borderRadius={isMobile ? "md" : "lg"}
                />
                
                <Box textAlign="left" w="100%" overflow="hidden">
                  <EllipsisText mb={1}>タイトル： {channel.channelName}</EllipsisText>
                  <Divider borderWidth={1} borderColor="gray.700" mb={1} />
                  <EllipsisText>作成者： {channel.channelAdmin.name}</EllipsisText>
                </Box>
                
                <Box color="gray.700"><FaEllipsisH /></Box>
              </Flex>
            </Box>
          );
        })}
        {selectedChannel && (
          <ModalTemplete
            isOpen={channelInfo.isOpen}
            onClose={channelInfo.onClose}
            title={"チャンネル情報"}
          >
            <ChannelInfo selectedChannel={selectedChannel} />
          </ModalTemplete>
        )}
      </Stack>
    ) : (
      <ChatLoading />
    )
  );
};

export default ChannelList;
