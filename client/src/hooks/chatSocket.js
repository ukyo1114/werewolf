import { useEffect, useRef } from "react";
import io from "socket.io-client";
import useNotification from "./notification";
import { useUserState } from "../context/userProvider";

const useChatSocket = ({ setMessages }) => {
  const { user, currentChannel, setCurrentChannel } = useUserState();

  const chatSocketRef = useRef(null);
  const showToast = useNotification();

  useEffect(() => {
    if (chatSocketRef.current) return;
    
    const auth = { auth: { token: user.token } };
    chatSocketRef.current = io("http://localhost:5000/chat", auth);

    chatSocketRef.current.on("connect", () => {
      chatSocketRef.current.emit("join channel", currentChannel._id);
    });

    chatSocketRef.current.on("messageReceived", (newMessageReceived) => {
      console.log("messageReceived");
      setMessages((prevMessages) => {
        if (!prevMessages.some((msg) => msg._id === newMessageReceived._id)) {
          const updatedMessages = [newMessageReceived, ...prevMessages];
          return updatedMessages.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        }
        return prevMessages;
      });
    });

    chatSocketRef.current.on("user added", (user) => {
      const userId = user._id;
      setCurrentChannel((prevCurrentChannel) => {
        if (!prevCurrentChannel.users.some((u) => u._id === userId)) {
          return {
            ...prevCurrentChannel,
            users: [...prevCurrentChannel.users, user],
          };
        }

        return prevCurrentChannel;
      });
    });

    chatSocketRef.current.on("user left", (userId) => {
      setCurrentChannel((prevCurrentChannel) => {
        const updatedUsers = prevCurrentChannel.users.filter(
          (user) => user._id !== userId
        );

        return {
          ...prevCurrentChannel,
          users: updatedUsers,
        };
      });
    });

    chatSocketRef.current.on("registerBlockUser", (blockUser) => {
      setCurrentChannel((prevCurrentChannel) => {
        const updatedUsers = prevCurrentChannel.users.filter(
          (user) => user._id !== blockUser
        );

        if (!prevCurrentChannel.blockUsers.includes(blockUser)) {
          return {
            ...prevCurrentChannel,
            users: updatedUsers,
            blockUsers: [...prevCurrentChannel.blockUsers, blockUser],
          };
        }

        return {
          ...prevCurrentChannel,
          users: updatedUsers,
        };
      });
    });

    chatSocketRef.current.on("cancelBlockUser", (blockUser) => {
      setCurrentChannel((prevCurrentChannel) => {
        const updatedBlockUsers = prevCurrentChannel.blockUsers.filter(
          (user) => user !== blockUser
        );

        return {
          ...prevCurrentChannel,
          blockUsers: updatedBlockUsers,
        };
      });
    });

    chatSocketRef.current.on("connect_error", (err) => {
      showToast(err.message, "error");
    });

    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.disconnect();
        chatSocketRef.current = null;
      }
    };
  }, [
    user.token,
    currentChannel._id,
    setCurrentChannel,
    setMessages,
    showToast,
  ]);
};

export default useChatSocket;
