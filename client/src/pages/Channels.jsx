import { useState, useEffect, Suspense, lazy } from "react";

import { Flex, Stack } from "@chakra-ui/react";

import { useUserState } from "../context/UserProvider.jsx";
import ChannelList from "../components/channelList/ChannelList.jsx";
import { ChannelHeader } from "../components/channels/ChannelHeader.jsx";
import ChannelListSidebar from "../components/channelList/ChannelListSidebar.jsx";

const Channel = lazy(() => import("../components/channel/Channel.jsx"));
const ChannelSidebar = lazy(() => import("../components/channelSideBar/ChannelSidebar.jsx"));
const GameSidebar = lazy(() => import("../components/gameSidebar/GameSidebar.jsx"));

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
  }, [isGame, setMode, channelId]);

  if (!user.token) return null;

  return (
    <Flex justifyContent="center" w="100%" h="100dvh" overflow="hidden">
      {!isMobile && <Suspense fallback={<div>Loading...</div>}>{modeConfig[mode]}</Suspense>}
      <Stack
        alignItems="center"
        maxW="600px"
        overflow="hidden"
        w="100%"
      >
        <ChannelHeader
          mode={mode}
          showJoinedCh={showJoinedCh}
          setShowJoinedCh={setShowJoinedCh}
        />
        <Suspense fallback={<div>Loading...</div>}>
          {channelId ?
            <Channel key={channelId} /> :
            <ChannelList showJoinedCh={showJoinedCh} />
          }
        </Suspense>
      </Stack>
    </Flex>
  )
};

export default Channels;
