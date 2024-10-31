import React, { useEffect, useState, useCallback } from "react";
import { useUserState } from "../../context/userProvider";
import {
  Box,
  Divider,
  Flex,
  Avatar,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEllipsisH } from "react-icons/fa";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import ChannelListHeader from "./ChannelListHeader";
import Sidebar from "../miscellaneous/SideBar";
import ChannelListSidebar from "./ChannelListSidebar";
import ChannelInfo from "./ChannelInfo";
import useNotification from "../../hooks/notification";
import { errors } from "../../messages";
import ModalTemplete from "../miscellaneous/ModalTemplete";
import { ChannelBox } from "../miscellaneous/CustomComponents";

const ChannelList = () => {
  const { user } = useUserState();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showJoinedCh, setShowJoinedCh] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const channelInfo = useDisclosure();
  const showToast = useNotification();

  const fetchChannelList = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      console.log("fetchChannelList", config);

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
      <Sidebar Component={ChannelListSidebar} />
      <ChannelBox>
        <ChannelListHeader
          showJoinedCh={showJoinedCh}
          setShowJoinedCh={setShowJoinedCh}
        />
        <Divider borderWidth={2} borderColor="#E17875" opacity={1} />
        {channelList ? (
          <Stack overflowY="auto" width="100%" p={3} gap={4}>
            {filteredChannelList.map((channel) => {
              if (!channel.channelAdmin) return null;

              return (
                <Box
                  data-key={channel._id} // テスト用
                  onClick={() => handleChannelSelect(channel)}
                  cursor="pointer"
                  bg={channel.users.includes(user._id) ? "#E17875" : "#2B2024"}
                  px={3}
                  py={2}
                  width="100%"
                  borderRadius="lg"
                  borderWidth={2}
                  borderColor={channel.users.includes(user._id) ? "white" : "#E17875"}
                  key={channel._id}
                  _hover={{
                    bg: channel.users.includes(user._id) ? "#FF6F61" : "#3B2C2F",
                  }}
                >
                  <Flex justify="space-between" align="center" width="100%" gap={4}>
                    <Avatar
                      size="lg"
                      name={channel.channelAdmin.name}
                      src={channel.channelAdmin.pic}
                      borderRadius="md"
                    />
                    <Box ml={3} textAlign="left" w="100%">
                      <Text mb={1}>タイトル: {channel.channelName}</Text>
                      <Divider
                        borderWidth={1}
                        borderColor={channel.users.includes(user._id) ? "white" : "#E17875"}
                        mb={1}
                      />
                      <Text>作成者: {channel.channelAdmin.name}</Text>
                    </Box>
                    <FaEllipsisH color={channel.users.includes(user._id) ? "white" : "#E17875"}/>
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
