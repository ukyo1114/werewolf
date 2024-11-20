import React, { useEffect, useReducer, useCallback, useRef } from "react";
import { Box, Divider, FormControl, Spinner, Textarea } from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import ChannelSidebar from "../channelSideBar/ChannelSidebar.jsx";
import GameSidebar from "../gameSidebar/GameSidebar.jsx";
import useChatMessages from "../../hooks/useChatMessages";
import useChatSocket from "../../hooks/useChatSocket";
import TextareaAutosize from "react-textarea-autosize";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { channelValidationSchema } from "../channel/validationSchema";
import EntryCounter from "./EntryCounter.jsx";
import GameTimer from "./GameTimer.jsx";
import Sidebar from "../miscellaneous/SideBar.jsx";
import DisplayMessage from "./DisplayMessage.jsx";
import { GAME_MASTER } from "../../constants";
import { ChannelBox } from "../miscellaneous/CustomComponents.jsx";
import messagesReducer from "../../reducers/messageReducer";

const Channel = () => {
  const [messages, mDispatch] = useReducer(messagesReducer, []);
  const { user, currentChannel, cDispatch, isMobile } = useUserState();
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
      <Sidebar>
        {isGame ? <GameSidebar /> : <ChannelSidebar />}
      </Sidebar>
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
                const chatUser = (m.sender === GAME_MASTER._id) ? GAME_MASTER :
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
