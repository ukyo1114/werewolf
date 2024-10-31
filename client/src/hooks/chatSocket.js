import { useEffect, useRef } from "react";
import io from "socket.io-client";
import useNotification from "./notification";
import { useUserState } from "../context/userProvider";

const useChatSocket = ({ setMessages }) => {
  const { user, currentChannel, cDispatch } = useUserState();
  const { _id: channelId } = currentChannel;

  const chatSocketRef = useRef(null);
  const showToast = useNotification();

  useEffect(() => {
    if (chatSocketRef.current) return;
    
    const auth = { auth: { token: user.token } };
    chatSocketRef.current = io("http://localhost:5000/chat", auth);

    chatSocketRef.current.on("connect", () => {
      chatSocketRef.current.emit("joinChannel", channelId);
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

    chatSocketRef.current.on("userJoined", (user) => {
      cDispatch({ type: "USER_JOINED", payload: user });
    });

    chatSocketRef.current.on("userLeft", (userId) => {
      cDispatch({ type: "USER_LEFT", payload: userId });
    });

    chatSocketRef.current.on("registerBlockUser", (blockUser) => {
      cDispatch({ type: "USER_BLOCKED", payload: blockUser });
    });

    chatSocketRef.current.on("cancelBlockUser", (blockUser) => {
      cDispatch({ type: "CANCEL_BLOCK", payload: blockUser });
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
  }, [user.token, channelId, cDispatch, setMessages, showToast]);
};

export default useChatSocket;
