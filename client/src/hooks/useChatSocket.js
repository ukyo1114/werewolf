import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import useNotification from "./useNotification";
import { useUserState } from "../context/UserProvider.jsx";

const useChatSocket = ({ mDispatch }) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { user, currentChannel, chDispatch } = useUserState();
  const { _id: channelId } = currentChannel;

  const chatSocketRef = useRef(null);
  const showToast = useNotification();

  useEffect(() => {
    if (chatSocketRef.current) return;
    
    const auth = { auth: { token: user.token } };
    chatSocketRef.current = io(
      `${import.meta.env.VITE_SERVER_URL}/chat`,
      auth,
    );

    chatSocketRef.current.on("connect", () => {
      chatSocketRef.current.emit("joinChannel", channelId, (response) => {
        if (response.success) {
          setIsSocketConnected(true);
        } else {
          showToast(response.err, "error");
        }
      });
    });

    chatSocketRef.current.on("messageReceived", (newMessageReceived) => {
      mDispatch({ type: "RECEIVE_MESSAGE", payload: newMessageReceived });
    });

    chatSocketRef.current.on("cSettingsChanged", (updatedChannel) => {
      chDispatch({ type: "CHANNEL_SETTINGS", payload: updatedChannel });
    });

    chatSocketRef.current.on("userJoined", (user) => {
      chDispatch({ type: "USER_JOINED", payload: user });
    });

    chatSocketRef.current.on("userLeft", (userId) => {
      chDispatch({ type: "USER_LEFT", payload: userId });
    });

    chatSocketRef.current.on("registerBlockUser", (blockUser) => {
      chDispatch({ type: "USER_BLOCKED", payload: blockUser });
    });

    chatSocketRef.current.on("cancelBlockUser", (blockUser) => {
      chDispatch({ type: "CANCEL_BLOCK", payload: blockUser });
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
  }, [user.token, channelId, setIsSocketConnected, chDispatch, mDispatch, showToast]);

  return isSocketConnected;
};

export default useChatSocket;
