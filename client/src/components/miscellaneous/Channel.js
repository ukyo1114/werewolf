import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Divider,
  Flex,
  Text,
  FormControl,
  Spinner,
  Avatar,
  Textarea,
} from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import "../styles.css";
import ChannelSidebar from "../channelSideBar/ChannelSidebar";
import GameSidebar from "../gameSidebar/GameSidebar";
import useChatMessages from "../../hooks/chatMessages";
import useChatSocket from "../../hooks/chatSocket";
import TextareaAutosize from "react-textarea-autosize";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { channelValidationSchema } from "../channel/validationSchema";
import EntryCounter from "./EntryCounter";
import GameTimer from "./GameTimer";
import Sidebar from "./SideBar";

const Channel = () => {
  const [messages, setMessages] = useState([]);
  const { user, currentChannel, setCurrentChannel, gameState } = useUserState();
  const scrollRef = useRef(null);
  const isScrollRef = useRef(null);
  const messagesCompletedRef = useRef(null);

  const { loading, fetchMessages, sendMessage } = useChatMessages({
    messages,
    setMessages,
    messagesCompletedRef,
  });

  useChatSocket({ setMessages });

  const handleSendMessage = async (values, actions) => {
    const { newMessage } = values;
    await sendMessage(newMessage);
    actions.setSubmitting(false);
    actions.resetForm();
  };

  const handleScroll = useCallback(async () => { // 外部化
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop >= 0) {
        isScrollRef.current = false;
      } else {
        isScrollRef.current = true;
      }
      if (
        scrollTop + scrollHeight - clientHeight <= 1 &&
        !messagesCompletedRef.current
      ) {
        const prevScrollTop = scrollTop;
        await fetchMessages();
        setTimeout(() => {
          scrollRef.current.scrollTop = prevScrollTop;
        }, 0);
      }
    }
  }, [fetchMessages]);

/*   useEffect(() => { // 処理を変更
    if (chatSocketRef.current) {
      chatSocketRef.current.on("reconnect", () => {
      });
    }
  }, []); */

  useEffect(() => {
    if (currentChannel?.blockUsers?.some((u) => u === user._id)) {
      setCurrentChannel(null);
    }
  }, [user._id, currentChannel.blockUsers, setCurrentChannel]);

  useEffect(() => {
    if (currentChannel._id && messages.length === 0) fetchMessages();
  }, [currentChannel._id, messages, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      if (!isScrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      setCurrentChannel(null);
    };
  }, [setCurrentChannel]);

  return (
    <>
      <Sidebar Component={gameState ? GameSidebar : ChannelSidebar} />
      <Box
        display="flex"
        alignItems="center"
        flexDir="column"
        bg="#ffe2f1"
        maxWidth="600px"
        width="100%"
        borderLeftWidth={1}
        borderColor="#ff94b1"
      >
        {gameState ? <GameTimer /> : <EntryCounter/>}
        <Divider borderWidth={1} />
        <Box
          display="flex"
          flexDir="column"
          justifyContent="flex-end"
          p={4}
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
        >
          
          {loading ? (
            <Spinner
              size="xl"
              w={20}
              h={20}
              alignSelf="center"
              margin="auto"
            />
          ) : (
            <div
              className="messages custom-scrollbar"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {messages &&
                messages.map((m) => {
                  const chatUser = currentChannel.users.find((u) => u._id === m.sender);
                  if (!chatUser) return null;

                  return (
                    <Box display="flex" key={m._id} p={2} gap={1}>
                      <Avatar
                        size="lg"
                        src={chatUser.pic}
                        borderRadius="md"
                      />
                      <Flex direction="column" width="100%">
                        <Flex justify="space-between" align="center" width="100%" px={2}>
                          <Text fontWeight="bold">{chatUser.name}</Text>
                            <Text fontWeight="bold">
                              {new Date(m.createdAt).toLocaleString()}
                          </Text>
                        </Flex>
                        <Box
                          bg={
                            m.messageType === "werewolf"
                              ? "#FFCCCB"
                              : m.messageType === "spectator"
                                ? "#D3D3D3"
                                : m.sender._id === user._id
                                  ? "#BEE3F8"
                                  : "#B9F5D0"
                          }
                          borderRadius="md"
                          px={4}
                          py={2}
                          width="100%"
                        >
                          <Text whiteSpace="pre-wrap">{m.content}</Text>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
            </div>
          )}
          <Formik
            initialValues={{ newMessage: "" }}
            validationSchema={channelValidationSchema}
            onSubmit={handleSendMessage}
            validateOnBlur={false}
          >
            {(formik) => (
              <Form>
                <FormControl mt={3} isRequired>
                  <Field name="newMessage">
                    {({ field }) => (
                      <Textarea
                        {...field}
                        className="custom-scrollbar"
                        variant="filled"
                        placeholder="Enter a message..."
                        resize="none"
                        overflowY="auto"
                        minHeight="42px"
                        maxHeight="400px"
                        bg="#E0E0E0"
                        as={TextareaAutosize}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            formik.handleSubmit();
                          }
                        }}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="newMessage"
                    component="div"
                    style={{ color: "red", fontSize: "smaller" }}
                  />
                </FormControl>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </>
  );
};

export default Channel;
