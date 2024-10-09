import React from "react";
import { useUserState } from "../context/userProvider";
import { Box } from "@chakra-ui/react";
import ChannelList from "../components/channelList/ChannelList";
import Channel from "../components/miscellaneous/Channel";
import ChannelHeader from "../components/channel/channelHeader";

const Channels = () => {
  const { user, currentChannel } = useUserState();

  if (!user) return null;

  return (
    <div style={{ width: "100%" }}>
      <ChannelHeader />
      <Box
        display="flex"
        justifyContent="center"
        width="100%"
        height="91.5vh"
        padding="10px"
      >
        {currentChannel ?
          <Channel key={currentChannel._id} /> : <ChannelList />
        }
      </Box>
    </div>
  )
};

export default Channels;
