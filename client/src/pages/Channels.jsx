import { useState, useEffect } from "react";
import { useUserState } from "../context/UserProvider.jsx";
import { Flex } from "@chakra-ui/react";
import ChannelList from "../components/channelList/ChannelList.jsx";
import Channel from "../components/channel/Channel.jsx";

import { ChannelHeader } from "../components/channels/ChannelHeader.jsx";

import ChannelListSidebar from "../components/channelList/ChannelListSidebar.jsx";
import ChannelSidebar from "../components/channelSideBar/ChannelSidebar.jsx";
import GameSidebar from "../components/gameSidebar/GameSidebar.jsx";

const Channels = () => {
  const [mode, setMode] = useState(null);
  const [showJoinedCh, setShowJoinedCh] = useState(false);
  const { user, currentChannel, isMobile } = useUserState();
  const { _id: channelId, isGame } = currentChannel;

  const modeConfig = {
    channelList: <ChannelListSidebar />,
    channel: <ChannelSidebar />,
    game: <GameSidebar />,
  };

  useEffect(() => {
    if (channelId) setShowJoinedCh(false);
  }, [channelId]);

  useEffect(() => {
    const currentMode = channelId ? (
      isGame ? "game" : "channel"
    ) : "channelList";
    setMode(currentMode);
  }, [setMode, channelId]);

  if (!user.token) return null;

  return (
    <Flex justifyContent="center" w="100%" h="100dvh" overflow="hidden">
      {!isMobile && modeConfig[mode]}
      <Flex
        alignItems="center"
        flexDir="column"
        maxW="600px"
        overflow="hidden"
        w="100%"
      >
        <ChannelHeader
          mode={mode}
          showJoinedCh={showJoinedCh}
          setShowJoinedCh={setShowJoinedCh}
        />
        {channelId ?
          <Channel key={channelId} /> :
          <ChannelList showJoinedCh={showJoinedCh} />
        }
      </Flex>
    </Flex>
  )
};

export default Channels;
