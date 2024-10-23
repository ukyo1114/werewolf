import React, { useState, useEffect } from "react";
import {
  useToast,
  Box,
  Text,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import "../styles.css";
import io from "socket.io-client";
import { ChevronDownIcon } from "@chakra-ui/icons";
import UserList from "./UserList";
import ModalTemplete from "./ModalTemplete";
let entrySocket;

const EntryCounter = () => {
  const { user, currentChannel, setCurrentChannel, setGameState } = useUserState();
  const [users, setUsers] = useState([]);
  const [entryButtonState, setEntryButtonState] = useState(false);
  const toast = useToast();
  const userList = useDisclosure();

  useEffect(() => {
    entrySocket = io("http://localhost:5000/entry", {
      auth: {
        token: user.token,
      },
    });

    entrySocket.on("connect", async () => {
      try {
        const response = await entrySocket.emitWithAck(
          "joinChannel",
          currentChannel._id,
        );
        setUsers(response.users);
      } catch (error) {
        toast({
          title: "Error !",
          description: "接続に失敗しました。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        entrySocket.disconnect();
      }
    });

    entrySocket.on("entryUpdate", (data) => {
      setUsers(data);
    });

    entrySocket.on("gameStart", (game) => {
      console.log("gameStart", game);
      setCurrentChannel(game);
      setGameState({ gameId: game._id });
    });

    entrySocket.on("connect_error", (err) => {
      toast({
        title: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    });

    return () => {
      entrySocket.disconnect();
    };
  }, [user.token, currentChannel._id, toast, setCurrentChannel, setGameState]);

  useEffect(() => {
    if (users.some((u) => u === user._id)) {
      setEntryButtonState(true);
    } else {
      setEntryButtonState(false);
    }
  }, [users, user, setEntryButtonState]);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      w="100%"
      px={4}
      py={3}
    >
      <Text fontSize="lg"><strong>{currentChannel.channelName}</strong></Text>
      <Box display="flex" alignItems="center">
        <Text
          fontSize="lg"
          fontWeight="bold"
          onClick={userList.onOpen}
          cursor="pointer"
          display="flex"
          alignItems="center"
          px={2}
          mr={2}
          py="5px"
          borderRadius="md"
          _hover={{ bg: "#3B2C2F" }}
        >
          {users.length}/10人
          <ChevronDownIcon ml={1} />
        </Text>
        <Button
          data-testid="entry-button" // テスト用
          colorScheme={entryButtonState ? "pink" : "teal"}
          onClick={() =>
            entryButtonState
              ? entrySocket.emit("cancelEntry")
              : entrySocket.emit("registerEntry", user)
          }
        >
          {entryButtonState ? "取消" : "参加"}
        </Button>
      </Box>

      {users && currentChannel?.users && (
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
    </Box>
  );
};

export default EntryCounter;
