import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import {
  Stack,
  Tabs, TabList, Tab, TabPanels, TabPanel,
} from "@chakra-ui/react";

import { useUserState } from "../../context/UserProvider.jsx";
import useNotification from "../../hooks/useNotification";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";
import { StyledText } from "../miscellaneous/CustomComponents.jsx";
import { messages } from "../../messages.js";

const BlockModal = () => {
  const { user, currentChannel } = useUserState();
  const [blockUserList, setBlockUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBUser, setSelectedBUser] = useState(null);
  const showToast = useNotification();
  const { _id: channelId, channelAdmin } = currentChannel;

  const fetchBlockUserList = useCallback(async () => {
    if (channelAdmin !== user._id) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data: { blockUsers } } = await axios.get(
        `api/block/user-list/${channelId}`,
        config,
      );
      
      setBlockUserList(blockUsers);
    } catch (error) {
      showToast(error?.response?.data?.error || "ブロック済みユーザーの取得に失敗しました", "error");
    }
  }, [user, channelId, channelAdmin, setBlockUserList, showToast]);

  useEffect(() => {
    fetchBlockUserList();
  }, [fetchBlockUserList]);

  return (
    <Tabs display="flex" flexDir="column" overflow="hidden">
      <TabList>
        <Tab w="50%">ブロック</Tab>
        <Tab w="50%">解除</Tab>
      </TabList>
      <TabPanels display="flex" overflow="hidden">
        <TabPanel key="block" w="100%" p={0} display="flex" overflow="hidden">
          <UserListTab
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            setBlockUserList={setBlockUserList}
          />
        </TabPanel>
        <TabPanel key="cancel" w="100%" p={0} display="flex" overflow="hidden">
          <BlockedUserListTab
            selectedBUser={selectedBUser}
            setSelectedBUser={setSelectedBUser}
            blockUserList={blockUserList}
            setBlockUserList={setBlockUserList}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

const UserListTab = ({
  selectedUser,
  setSelectedUser,
  setBlockUserList,
}) => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId, channelAdmin, users } = currentChannel;
  const showToast = useNotification();

  const block = useCallback(async () => {
    if (channelAdmin !== user._id) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.put(
        "api/block/register",
        { channelId, selectedUser },
        config,
      );

      setBlockUserList((prevBlockUserList) => {
        if (!prevBlockUserList.some((user) => user._id === selectedUser)) {
          const blockedUser = users.find((user) => user._id === selectedUser);
          return [...prevBlockUserList, blockedUser];
        }
      });

      showToast(messages.BLOCK_COMPLETED, "success");
      setSelectedUser(null);
    } catch (error) {
      showToast(error?.response?.data?.error || "ブロックに失敗しました", "error");
    }
  }, [
    user,
    channelId,
    channelAdmin,
    users,
    selectedUser,
    setSelectedUser,
    setBlockUserList,
    showToast,
  ]);

  return (
    <Stack w="100%" overflow="hidden">
      <Stack p={2} gap={4} flex="1" overflow="auto">
        {users.length > 1 ? (
          users.filter((u) => u._id !== user._id).map((u) => (
            <DisplayUser
              key={u._id}
              user={u}
              cursor="pointer"
              onClick={() => setSelectedUser(u._id)}
              bg={selectedUser === u._id ? "green.100" : "white"}
              _hover={{
                bg: selectedUser !== u._id ? "gray.200" : undefined,
              }}
            />
          ))
        ) : (
          <StyledText>ユーザーがいません</StyledText>
        )}
      </Stack>

      <ModalButton onClick={block} isDisabled={!selectedUser}>
        ブロック
      </ModalButton>
    </Stack>
  );
};

const BlockedUserListTab = ({
  selectedBUser,
  setSelectedBUser,
  blockUserList,
  setBlockUserList,
}) => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId, channelAdmin } = currentChannel;
  const showToast = useNotification();

  const cancelBlock = useCallback(async () => {
    if (channelAdmin !== user._id) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      await axios.put(
        "api/block/cancel", { channelId, selectedBUser }, config,
      );

      setBlockUserList((prevBlockUserList) => {
        const updatedBUserList = prevBlockUserList.filter((user) =>
          user._id !== selectedBUser
        )
        return updatedBUserList;
      })

      showToast(messages.BLOCK_CANCEL_COMPLETED, "success");
      setSelectedBUser(null);
    } catch (error) {
      showToast(error.response?.data?.error || "ブロック済ユーザーの取得に失敗しました", "error");
    }
  }, [
    user,
    channelId,
    channelAdmin,
    selectedBUser,
    setSelectedBUser,
    setBlockUserList,
    showToast,
  ]);

  return (
    <Stack w="100%" overflow="hidden">
      <Stack p={2} gap={4} flex="1" overflow="auto">
        {blockUserList.length > 0 ? (
          blockUserList.map((u) => (
            <DisplayUser
              key={u._id}
              user={u}
              cursor="pointer"
              onClick={() => setSelectedBUser(u._id)}
              bg={selectedBUser === u._id ? "green.100" : "white"}
              _hover={{
                bg: selectedBUser !== u._id ? "gray.200" : undefined,
              }}
            />
          ))
        ) : (
          <StyledText>ユーザーがいません</StyledText>
        )}
      </Stack>

      <ModalButton onClick={cancelBlock} isDisabled={!selectedBUser}>
        解除
      </ModalButton>
    </Stack>
  );
};

export default BlockModal;
