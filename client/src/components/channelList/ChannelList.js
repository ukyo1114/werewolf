import React, { useEffect, useState, useCallback } from "react";
import { useUserState } from "../../context/userProvider";
import {
  Box,
  Flex,
  Button,
  Stack,
  Text,
  useToast,
  Checkbox,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import CreateChannelModal from "./CreateChannelModal";
import ChannelInfo from "./ChannelInfo";

const ChannelList = () => {
  const { user } = useUserState();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [showJoinedCh, setShowJoinedCh] = useState(null);
  const [channelList, setChannelList] = useState(null);
  const toast = useToast();
  const channelInfo = useDisclosure();
  const createChModal = useDisclosure();

  const fetchChannelList = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/channel/list", config);
      data.sort((a, b) => b.users.length - a.users.length);
      setChannelList(data);
    } catch (error) {
      toast({
        title: "Error Occured !",
        description: "Failed to Load Chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [user.token, toast]);

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
    <Box
      display="flex"
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      maxWidth="600px"
      width="100%"
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        チャンネルリスト
        <Button
          display="flex"
          fontSize={{ base: "10px", lg: "17px" }}
          rightIcon={<AddIcon />}
          onClick={createChModal.onOpen}
        >
          作成
        </Button>        
        <CreateChannelModal
          isOpen={createChModal.isOpen}
          onClose={createChModal.onClose}
        />
      </Box>
      <Box pb={3} px={3} mb={4} display="flex" w="100%" alignItems="center">
        <Checkbox
          id="isJoined"
          isChecked={showJoinedCh}
          onChange={(e) => setShowJoinedCh(e.target.checked)}
        >
          参加中のみ
        </Checkbox>
      </Box>
      {channelList ? (
        <Stack overflowY="scroll" width="100%">
          {filteredChannelList.map((channel) => (
            <Box
              onClick={() => handleChannelSelect(channel)}
              cursor="pointer"
              bg={channel.users.includes(user._id) ? "#38B2AC" : "#E8E8E8"}
              color={channel.users.includes(user._id) ? "white" : "black"}
              px={3}
              py={2}
              width="100%"
              borderRadius="lg"
              key={channel._id}
            >
              <Flex justify="space-between" align="center" width="100%">
                <Text>{channel.channelName}</Text>
                <Text fontSize="sm">作成者: {channel.channelAdmin?.name}</Text>
              </Flex>
            </Box>
          ))}
        </Stack>
      ) : (
        <ChatLoading />
      )}
      {selectedChannel && (
        <ChannelInfo
          isOpen={channelInfo.isOpen}
          onClose={channelInfo.onClose}
          selectedChannel={selectedChannel}
        />
      )}
    </Box>
  );
};

export default ChannelList;
