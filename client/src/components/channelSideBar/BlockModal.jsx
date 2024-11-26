import React, { useState, useEffect, useCallback } from "react";
import {
  Stack,
  ModalBody,
  Tabs, TabList, Tab, TabPanels, TabPanel,
} from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import axios from "axios";
import useNotification from "../../hooks/useNotification";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";
import { StyledText } from "../miscellaneous/CustomComponents.jsx";

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
      <Tabs>
        <TabList>
          <Tab w="50%">ブロック</Tab>
          <Tab w="50%">解除</Tab>
        </TabList>
        <TabPanels>
          <TabPanel key="block">
            <UserListTab
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              setBlockUserList={setBlockUserList}
            />
          </TabPanel>
          <TabPanel key="cancel">
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
    <>
      <Stack gap={4} p={4} maxHeight="60vh" overflowY="auto">
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
      <ModalButton
        innerText={"ブロック"}
        onClick={block}
        disableCondition={!selectedUser}
      />
    </>
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
    <>
      <Stack gap={4} p={4} maxHeight="60vh" overflowY="auto">
        {blockUserList.length > 0 ? (
          blockUserList.map((u) => (
            <DisplayUser
              key={u._id}
              user={u}
              cursor="pointer"
              onClick={() => setSelectedBlockUser(u._id)}
              bg={selectedBlockUser === u._id ? "green.100" : "white"}
              _hover={{
                bg: selectedBlockUser !== u._id ? "gray.200" : undefined,
              }}
            />
          ))
        ) : (
          <StyledText>ユーザーがいません</StyledText>
        )}
      </Stack>
      <ModalButton
        innerText={"解除"}
        onClick={cancelBlock}
        disableCondition={!selectedBlockUser}
      />
    </>

  );
};

export default BlockModal;
