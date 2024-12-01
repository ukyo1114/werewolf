import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import {
  Flex, Button, useDisclosure,
} from "@chakra-ui/react";

import { useUserState } from "../../context/UserProvider.jsx";
import { ChevronDownIcon } from "@chakra-ui/icons";
import UserList from "../miscellaneous/UserList.jsx";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";
import useNotification from "../../hooks/useNotification";
import useJoinGame from "../../hooks/useJoinGame";
import { errors, messages } from "../../messages";

const EntryCounter = () => {
  const { user, currentChannel } = useUserState();
  const [users, setUsers] = useState([]);
  const [entryButtonState, setEntryButtonState] = useState(false);
  const showToast = useNotification();
  const userList = useDisclosure();
  const { _id: channelId, channelName } = currentChannel;
  const joinGame = useJoinGame();

  const entrySocketRef = useRef(null);

  useEffect(() => {
    if (entrySocketRef.current) return;

    const auth = { auth: { token: user.token } };
    entrySocketRef.current = io(
      `${import.meta.env.VITE_SERVER_URL}/entry`,
      auth,
    );

    entrySocketRef.current.on("connect_response", async ({ gameId }) => {
      if (gameId) {
        showToast(messages.NAVIGATE_GAME, "info");
        await joinGame(gameId);
      } else {
        try {
          const response = await entrySocketRef.current.emitWithAck(
            "joinChannel",
            channelId,
          );
          setUsers(response.users);
        } catch (error) {
          showToast(
            error?.response?.data?.error || errors.CONNECTION_FAILED, "error"
          );
          entrySocketRef.current.disconnect();
        }
      }
    });

    entrySocketRef.current.on("entryUpdate", (data) => {
      setUsers(data);
    });

    entrySocketRef.current.on("gameStart", async (gameId) => {
      await joinGame(gameId);
    });

    entrySocketRef.current.on("connect_error", (err) => {
      showToast(err.message, "error");
    });

    return () => {
      entrySocketRef.current.disconnect();
    };
  }, [user.token, channelId, showToast, joinGame]);

  useEffect(() => {
    if (users.some((u) => u === user._id)) {
      setEntryButtonState(true);
    } else {
      setEntryButtonState(false);
    }
  }, [users, user._id, setEntryButtonState]);

  return (
    <>
      <EllipsisText fontSize="lg" fontWeight="bold" color="gray.700">
        {channelName}
      </EllipsisText>
      
      <Flex alignItems="center">
        <EllipsisText
          fontSize="lg"
          onClick={userList.onOpen}
          cursor="pointer"
          display="flex"
          alignItems="center"
          px={2}
          mr={2}
          py="5px"
          borderRadius="md"
          _hover={{ bg: "gray.200" }}
        >
          {users.length}/10人
          <ChevronDownIcon ml={1} />
        </EllipsisText>

        <Button
          data-testid="entry-button" // テスト用
          colorScheme={entryButtonState ? "pink" : "teal"}
          onClick={() =>
            entryButtonState
              ? entrySocketRef.current.emit("cancelEntry")
              : entrySocketRef.current.emit("registerEntry")
          }
        >
          {entryButtonState ? "取消" : "参加"}
        </Button>
      </Flex>

      {users && currentChannel.users && (
        <ModalTemplete
          isOpen={userList.isOpen}
          onClose={userList.onClose}
          title={"エントリー中のユーザー"}
        >
          <UserList userList={currentChannel.users.filter((user) =>
              users.some((u) => u === user._id))
            }
          />
        </ModalTemplete>
      )}
    </>
  );
};

export default EntryCounter;
