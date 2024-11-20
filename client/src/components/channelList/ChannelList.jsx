import React, { useEffect, useState, useCallback } from "react";
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
import axios from "axios";
import ChatLoading from "../ChatLoading.jsx";
import ChannelListHeader from "./ChannelListHeader.jsx";
import Sidebar from "../miscellaneous/SideBar.jsx";
import ChannelListSidebar from "./ChannelListSidebar.jsx";
import ChannelInfo from "./ChannelInfo.jsx";
import useNotification from "../../hooks/useNotification";
import { errors } from "../../messages";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import { ChannelBox, EllipsisText } from "../miscellaneous/CustomComponents.jsx";

const ChannelList = () => {
  const { user, isMobile } = useUserState();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showJoinedCh, setShowJoinedCh] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const channelInfo = useDisclosure();
  const showToast = useNotification();

  const fetchChannelList = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get("/api/channel/list", config);
      data.sort((a, b) => b.users.length - a.users.length);
      setChannelList(data);
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
    <>
      {!isMobile &&
        <Sidebar><ChannelListSidebar /></Sidebar>
      }
      <ChannelBox>
        <ChannelListHeader
          showJoinedCh={showJoinedCh}
          setShowJoinedCh={setShowJoinedCh}
        />
        {channelList ? (
          <Stack overflowY="auto" width="100%" p={4} gap={4}>
            {filteredChannelList.map((channel) => {
              if (!channel.channelAdmin) return null;

              return (
                <Box
                  data-key={channel._id} // テスト用
                  onClick={() => handleChannelSelect(channel)}
                  cursor="pointer"
                  bg={channel.users.includes(user._id) ? "green.100" : "white"}
                  px={3}
                  py={2}
                  width="100%"
                  borderRadius="lg"
                  key={channel._id}
                  _hover={{
                    bg: channel.users.includes(user._id) ? "green.200" : "gray.200",
                  }}
                  boxShadow="uniform"
                >
                  <Flex justify="space-between" align="center" width="100%" gap={4}>
                    <Avatar
                      size="lg"
                      name={channel.channelAdmin.name}
                      src={channel.channelAdmin.pic}
                      borderRadius="md"
                    />
                    <Box ml={3} textAlign="left" w="100%" overflow="hidden">
                      <EllipsisText mb={1}>タイトル： {channel.channelName}</EllipsisText>
                      <Divider borderWidth={1} borderColor="gray.700" mb={1} />
                      <EllipsisText>作成者： {channel.channelAdmin.name}</EllipsisText>
                    </Box>
                    <Box color="gray.700"><FaEllipsisH /></Box>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
        {selectedChannel && (
          <ModalTemplete
            isOpen={channelInfo.isOpen}
            onClose={channelInfo.onClose}
            title={"チャンネル情報"}
          >
            <ChannelInfo selectedChannel={selectedChannel} />
          </ModalTemplete>
        )}
      </ChannelBox>
    </>
  );
};

export default ChannelList;
