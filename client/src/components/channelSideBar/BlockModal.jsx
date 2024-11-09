import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/UserProvider.jsx";
import axios from "axios";
import useNotification from "../../hooks/useNotification";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";

const BlockModal = () => {
  const { user, currentChannel } = useUserState();
  const [blockUserList, setBlockUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBlockUser, setSelectedBlockUser] = useState(null);
  const showToast = useNotification();
  const { _id: channelId, channelAdmin } = currentChannel;

  const fetchBlockUserList = useCallback(async () => {
    if (channelAdmin !== user._id) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.get(
        `api/block/user-list/${channelId}`,
        config,
      );
      
      setBlockUserList(data);
    } catch (error) {
      showToast(error?.response?.data?.error || "ブロック済みユーザーの取得に失敗しました", "error");
    }
  }, [user, channelId, channelAdmin, setBlockUserList, showToast]);

  useEffect(() => {
    fetchBlockUserList();
  }, [fetchBlockUserList]);

  return (
        <ModalBody>
          <Tabs variant="soft-rounded" mb={4}>
            <TabList>
              <Tab
                w="50%"
                color="white"
                _selected={{ bg: "#E17875" }}
                _hover={{
                  ":not([aria-selected='true'])": { bg: "#3B2C2F" },
                }}
              >
                ブロック
              </Tab>
              <Tab
                w="50%"
                color="white"
                _selected={{ bg: "#E17875" }}
                _hover={{
                  ":not([aria-selected='true'])": { bg: "#3B2C2F" },
                }}
              >
                取消
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <UserListTab
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  setBlockUserList={setBlockUserList}
                />
              </TabPanel>
              <TabPanel>
                <BlockedUserListTab
                  selectedBlockUser={selectedBlockUser}
                  setSelectedBlockUser={setSelectedBlockUser}
                  blockUserList={blockUserList}
                  setBlockUserList={setBlockUserList}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
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

      const { data } = await axios.put(
        "api/block/register",
        { channelId, selectedUser: selectedUser },
        config,
      );
      setBlockUserList((prevBlockUserList) => {
        if (!prevBlockUserList.some((user) => user._id === data)) {
          const blockedUser = users.find((user) => user._id === data);
          return [...prevBlockUserList, blockedUser];
        }
      } // 既にブロックされているときの処理を追加する
      );/* 
      cDispatch((prevCurrentChannel) => {
        const updatedUsers = prevCurrentChannel.users.filter((user) => user._id !== data);
        return {
          ...prevCurrentChannel,
          users: updatedUsers,
        };
      }); */
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
    <Box display="flex" flexDir="column">
      {users.filter((u) => u._id !== user._id).map((u) => (
        <Box
          key={u._id}
          display="flex"
          alignItems="center"
          mb={3}
          p={3}
          borderRadius="md"
          borderWidth={2}
          borderColor={selectedUser === u._id ? "white" : "#E17875"}
          bg={selectedUser === u._id ? "#E17875" : "#2B2024"}
          _hover={{
            bg: selectedUser !== u._id ? "#3B2C2F" : undefined,
          }}
          cursor="pointer"
          onClick={() => setSelectedUser(u._id)}
        >
          <DisplayUser user={u} />
        </Box>
      ))}
      <ModalButton
        innerText={"ブロック"}
        onClick={block}
        disableCondition={!selectedUser}
      />
    </Box>
  );
};

const BlockedUserListTab = ({
  selectedBlockUser,
  setSelectedBlockUser,
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

      const { data } = await axios.put(
        "api/block/cancel", { channelId, selectedBlockUser }, config,
      );

      setBlockUserList((prevBlockUserList) => {
        const updatedBlockUserList = prevBlockUserList.filter((user) =>
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
    channelId,
    channelAdmin,
    selectedBlockUser,
    setSelectedBlockUser,
    setBlockUserList,
    showToast,
  ]);

  return (
    <Box display="flex" flexDir="column">
      {blockUserList.map((u) => (
        <Box
          key={u._id}
          display="flex"
          alignItems="center"
          mb={3}
          p={3}
          borderRadius="md"
          borderWidth={2}
          borderColor={selectedBlockUser === u._id ? "white" : "#E17875"}
          bg={selectedBlockUser === u._id ? "#E17875" : "#2B2024"}
          _hover={{
            bg: selectedBlockUser !== u._id ? "#3B2C2F" : undefined,
          }}
          cursor="pointer"
          onClick={() => setSelectedBlockUser(u._id)}
        >
          <DisplayUser user={u} />
        </Box>
      ))}
      <ModalButton
        innerText={"取消"}
        onClick={cancelBlock}
        disableCondition={!selectedBlockUser}
      />
    </Box>
  );
};

export default BlockModal;