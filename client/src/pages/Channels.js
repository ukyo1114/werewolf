import React from "react";
import { useUserState } from "../context/userProvider";
import { Box } from "@chakra-ui/react";
import ChannelList from "../components/channelList/ChannelList";
import Channel from "../components/channel/Channel";

const Channels = () => {
  const { user, currentChannel } = useUserState();
  const { _id: channelId } = currentChannel;
  if (!user.token) return null;

  return (
    <div style={{ width: "100%" }}>
      <Box
        display="flex"
        justifyContent="center"
        width="100%"
        height="100vh"
      >
        {channelId ?
          <Channel key={channelId} /> : <ChannelList />
        }
      </Box>
    </div>
  )
};

export default Channels;
