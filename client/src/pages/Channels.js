import React from "react";
import { useUserState } from "../context/userProvider";
import { Box } from "@chakra-ui/react";
import ChannelList from "../components/channelList/ChannelList";
import Channel from "../components/miscellaneous/Channel";

const Channels = () => {
  const { user, currentChannel } = useUserState();

  if (!user) return null;

  return (
    <div style={{ width: "100%" }}>
      <Box
        display="flex"
        justifyContent="center"
        width="100%"
        height="100vh"
      >
        {currentChannel ?
          <Channel key={currentChannel._id} /> : <ChannelList />
        }
      </Box>
    </div>
  )
};

export default Channels;
