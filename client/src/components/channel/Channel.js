import React, { useEffect, useReducer, useCallback, useRef } from "react";
import { Box, Divider, FormControl, Spinner, Textarea } from "@chakra-ui/react";
import { useUserState } from "../../context/userProvider";
import ChannelSidebar from "../channelSideBar/ChannelSidebar";
import GameSidebar from "../gameSidebar/GameSidebar";
import useChatMessages from "../../hooks/chatMessages";
import useChatSocket from "../../hooks/chatSocket";
import TextareaAutosize from "react-textarea-autosize";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { channelValidationSchema } from "../channel/validationSchema";
import EntryCounter from "./EntryCounter";
import GameTimer from "./GameTimer";
import Sidebar from "../miscellaneous/SideBar";
import DisplayMessage from "./DisplayMessage";
import { gameMaster } from "../../gameMaster";
import { ChannelBox } from "../miscellaneous/CustomComponents";
import messagesReducer from "../../reducers/messageReducer";

const Channel = () => {
  const [messages, mDispatch] = useReducer(messagesReducer, []);
  const { user, currentChannel, cDispatch } = useUserState();
  const scrollRef = useRef(null);
  const isScrollRef = useRef(null);
  const messagesCompletedRef = useRef(null);

  const { users, blockUsers, isGame } = currentChannel;

  const { loading, fetchMessages, sendMessage } = useChatMessages({
    messages,
    mDispatch,
    messagesCompletedRef,
  });

  useChatSocket({ mDispatch });

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

  useEffect(() => {
    if (blockUsers?.some((u) => u === user._id)) {
      cDispatch({ type: "LEAVE_CHANNEL"});
    }
  }, [user._id, blockUsers, cDispatch]);

  useEffect(() => {
    if (messages.length === 0) fetchMessages();
  }, [messages, fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      if (!isScrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  }, [messages]);

  return (
    <>
      <Sidebar Component={isGame ? GameSidebar : ChannelSidebar} />
      <ChannelBox>
        {isGame ? <GameTimer /> : <EntryCounter/>}
        <Divider borderWidth={2} borderColor="#E17875" opacity={1} />
        <Box
          display="flex"
          flexDir="column"
          justifyContent="flex-end"
          p={4}
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="auto"
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
            <Box
              display="flex"
              overflowY="auto"
              flexDir="column-reverse"
              ref={scrollRef}
              onScroll={handleScroll}
            >
              {messages && messages.map((m) => {
                const chatUser = (m.sender === gameMaster._id) ? gameMaster :
                  users.find((u) => u._id === m.sender);
                if (!chatUser) return null;

                return (
                  <DisplayMessage key={m._id} message={m} user={chatUser} />
                );
              })}
            </Box>
          )}

          <Formik
            initialValues={{ newMessage: "" }}
            validationSchema={channelValidationSchema}
            onSubmit={handleSendMessage}
            validateOnBlur={false}
          >
            {(formik) => (
              <Form>
                <FormControl my={3} isRequired>
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
                        color="black"
                        bg="#E0E0E0"
                        _focus={{ bg: "white" }} 
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
      </ChannelBox>
    </>
  );
};

export default Channel;
