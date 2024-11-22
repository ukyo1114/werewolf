import React, { useEffect, useReducer, useCallback, useRef } from "react";
import {
  Box, Flex, FormControl, Spinner, Textarea, IconButton
} from "@chakra-ui/react";
import { BiSend } from "react-icons/bi";
import { useUserState } from "../../context/UserProvider.jsx";
import useChatMessages from "../../hooks/useChatMessages";
import useChatSocket from "../../hooks/useChatSocket";
import TextareaAutosize from "react-textarea-autosize";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { channelValidationSchema } from "../channel/validationSchema";
import DisplayMessage from "./DisplayMessage.jsx";
import { GAME_MASTER } from "../../constants";
import messagesReducer from "../../reducers/messageReducer";

const Channel = () => {
  const [messages, mDispatch] = useReducer(messagesReducer, []);
  const { user, currentChannel, cDispatch } = useUserState();
  const scrollRef = useRef(null);
  const isScrollRef = useRef(null);
  const messagesCompletedRef = useRef(null);

  const { users, blockUsers } = currentChannel;

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
    <Flex
      flexDir="column"
      justifyContent="flex-end"
      p={4}
      w="100%"
      h="100%"
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
        <Flex
          overflowY="auto"
          flexDir="column-reverse"
          ref={scrollRef}
          onScroll={handleScroll}
          p={2}
        >
          {messages && messages.map((m) => {
            const chatUser = (m.sender === GAME_MASTER._id) ? GAME_MASTER :
              users.find((u) => u._id === m.sender);
            if (!chatUser) return null;

            return (
              <DisplayMessage key={m._id} message={m} user={chatUser} />
            );
          })}
        </Flex>
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
                  <Box position="relative" width="100%">
                    <Textarea
                      {...field}
                      variant="filled"
                      placeholder="Enter a message..."
                      resize="none"
                      pr="3rem"
                      overflowY="auto"
                      minHeight="42px"
                      maxHeight="300px"
                      as={TextareaAutosize}
                    />
                    <IconButton
                      aria-label="メッセージを送信"
                      icon={<BiSend />}
                      onClick={formik.handleSubmit}
                      position="absolute"
                      bottom={1}
                      right={2}
                      size="sm"
                      colorScheme="blue"
                      borderRadius="full"
                    />
                  </Box>
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
    </Flex>
  );
};

export default Channel;
