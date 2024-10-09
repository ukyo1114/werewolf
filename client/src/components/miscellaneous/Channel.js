import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
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

  return (
    <>
      {gameState ? <GameSidebar /> : <ChannelSidebar/>}
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
          display="flex"
          flexDir="column"
          justifyContent="flex-end"
          p={3}
          bg="#E8E8E8"
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
                    <Box display="flex" key={m._id}>
                      <Avatar
                        mt="7px"
                        mr={1}
                        size="lg"
                        src={chatUser.pic}
                        borderRadius="md"
                      />
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
                        p="5px 15px"
                        maxWidth="100%"
                        mt="7px"
                        mr={1}
                      >
                        <Text fontWeight="bold">{chatUser.name}</Text>
                        <Text fontWeight="bold">
                          {new Date(m.createdAt).toLocaleString()}
                        </Text>
                        <Text whiteSpace="pre-wrap">{m.content}</Text>
                      </Box>
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
