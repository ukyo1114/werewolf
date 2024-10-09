import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Image,
  Flex,
} from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/userProvider";
import axios from "axios";
import useNotification from "../../hooks/notification";

const BlockModal = ({ isOpen, onClose }) => {
  const { user, currentChannel } = useUserState();
  const [blockUserList, setBlockUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBlockUser, setSelectedBlockUser] = useState(null);
  const showToast = useNotification();

  const fetchBlockUserList = useCallback(async () => {
    if (currentChannel.channelAdmin !== user._id) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get(
        `api/block/user-list/${currentChannel._id}`,
        config,
      );
      
      setBlockUserList(data);
    } catch (error) {
      showToast(error?.response?.data?.error || "ブロック済みユーザーの取得に失敗しました", "error");
    }
  }, [user, currentChannel, setBlockUserList, showToast]);

  const handleOnClose = useCallback(() => {
    setSelectedUser(null);
    setSelectedBlockUser(null);
    onClose();
  }, [setSelectedUser, setSelectedBlockUser, onClose]);

  useEffect(() => {
    fetchBlockUserList();
  }, [fetchBlockUserList]);

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ブロック</ModalHeader>
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab w="50%">参加中</Tab>
              <Tab w="50%">ブロック済み</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <UserListTab
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  setBlockUserList={setBlockUserList}
                  onClose={handleOnClose}
                />
              </TabPanel>
              <TabPanel>
                <BlockedUserListTab
                  selectedBlockUser={selectedBlockUser}
                  setSelectedBlockUser={setSelectedBlockUser}
                  blockUserList={blockUserList}
                  setBlockUserList={setBlockUserList}
                  onClose={handleOnClose}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const UserListTab = ({
  selectedUser,
  setSelectedUser,
  setBlockUserList,
  onClose,
}) => {
  const { user, currentChannel, setCurrentChannel } = useUserState();
  const showToast = useNotification();

  const block = useCallback(async () => {
    if (currentChannel.channelAdmin !== user._id) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "api/block/register",
        {
          channelId: currentChannel._id,
          selectedUser: selectedUser,
        },
        config,
      );
      setBlockUserList((prevBlockUserList) => {
        if (!prevBlockUserList.some((user) => user._id === data)) {
          const blockedUser = currentChannel.users.find((user) => user._id === data);
          return [...prevBlockUserList, blockedUser];
        }
      }
      );
      setCurrentChannel((prevCurrentChannel) => {
        const updatedUsers = prevCurrentChannel.users.filter((user) => user._id !== data);
        return {
          ...prevCurrentChannel,
          users: updatedUsers,
        };
      });
      setSelectedUser(null);
    } catch (error) {
      showToast(error?.response?.data?.error || "ブロックに失敗しました", "error");
    }
  }, [
    user,
    currentChannel,
    selectedUser,
    setSelectedUser,
    setBlockUserList,
    setCurrentChannel,
    showToast,
  ]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {currentChannel.users
        .filter((u) => u._id !== user._id)
        .map((u) => (
          <Box
            key={u._id}
            display="flex"
            alignItems="center"
            mb={3}
            p={3}
            borderRadius="md"
            bg={selectedUser === u._id ? "blue.100" : "white"}
            cursor="pointer"
            onClick={() => setSelectedUser(u._id)}
          >
            <Image
              src={u.pic}
              alt={u.name}
              boxSize={16}
              borderRadius="md"
              mr={5}
            />
            <Text fontSize="lg">{u.name}</Text>
          </Box>
        ))}
      <Flex width="100%" justifyContent="space-evenly">
        <Button onClick={onClose}>Close</Button>
        <Button
          colorScheme="twitter"
          onClick={block}
          isDisabled={!selectedUser}
        >
          ブロック
        </Button>
      </Flex>
    </Box>
  );
};

const BlockedUserListTab = ({
  selectedBlockUser,
  setSelectedBlockUser,
  blockUserList,
  setBlockUserList,
  onClose,
}) => {
  const { user, currentChannel } = useUserState();
  const showToast = useNotification();

  const cancelBlock = useCallback(async () => {
    if (currentChannel.channelAdmin !== user._id) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "api/block/cancel",
        {
          channelId: currentChannel._id,
          selectedBlockUser: selectedBlockUser,
        },
        config,
      );
      setBlockUserList((prevBlockUserList) => {
        const updatedBlockUserList =  prevBlockUserList.filter((user) =>
          data.some((u) => u === user._id)
        )
        return updatedBlockUserList;
      })
      setSelectedBlockUser(null);
    } catch (error) {
      showToast(error.response?.data?.error || "ブロック済ユーザーの取得に失敗しました", "error");
    }
  }, [
    user,
    currentChannel,
    selectedBlockUser,
    setSelectedBlockUser,
    setBlockUserList,
    showToast,
  ]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {blockUserList.map((u) => (
        <Box
          key={u._id}
          display="flex"
          alignItems="center"
          mb={3}
          p={3}
          borderRadius="md"
          bg={selectedBlockUser === u._id ? "blue.100" : "white"}
          cursor="pointer"
          onClick={() => setSelectedBlockUser(u._id)}
        >
          <Image
            src={u.pic}
            alt={u.name}
            boxSize={16}
            borderRadius="md"
            mr={5}
          />
          <Text fontSize="lg">{u.name}</Text>
        </Box>
      ))}
      <Flex width="100%" justifyContent="space-evenly">
        <Button onClick={onClose}>Close</Button>
        <Button
          colorScheme="twitter"
          onClick={cancelBlock}
          isDisabled={!selectedBlockUser}
        >
          取消
        </Button>
      </Flex>
    </Box>
  );
};

export default BlockModal;
