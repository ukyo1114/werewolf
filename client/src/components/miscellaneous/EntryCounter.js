import React, { useState, useEffect } from "react";
import {
  useToast,
  Box,
  HStack,
  Text,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import "../styles.css";
import io from "socket.io-client";
import { ChevronDownIcon } from "@chakra-ui/icons";
import UserList from "./UserList";
let entrySocket;

const EntryCounter = () => {
  const { user, currentChannel, setCurrentChannel } = useUserState();
  const [users, setUsers] = useState([]);
  const [entryButtonState, setEntryButtonState] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      setCurrentChannel(game);
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
  }, [user.token, currentChannel._id, toast, setCurrentChannel]);

  useEffect(() => {
    if (users.some((u) => u === user._id)) {
      setEntryButtonState(true);
    } else {
      setEntryButtonState(false);
    }
  }, [users, user, setEntryButtonState]);

  return (
    <Box>
      <HStack spacing={4}>
        <Text
          fontSize="lg"
          fontWeight="bold"
          onClick={onOpen}
          cursor="pointer"
          display="flex"
          alignItems="center"
          bg="gray.100"
          p={2}
          borderRadius="md"
        >
          {users.length}/10人
          <ChevronDownIcon ml={1} />
        </Text>
        {entryButtonState ? (
          <Button
            colorScheme="red"
            onClick={() => entrySocket.emit("cancelEntry")}
          >
            取消
          </Button>
        ) : (
          <Button
            colorScheme="green"
            onClick={() => entrySocket.emit("registerEntry", user)}
          >
            参加
          </Button>
        )}
      </HStack>
      {users && currentChannel?.users && (
        <UserList
          isOpen={isOpen}
          onClose={onClose}
          userList={currentChannel.users.filter((user) =>
            users.some((u) => u === user._id),
          )}
        />
      )}
    </Box>
  );
};

export default EntryCounter;
