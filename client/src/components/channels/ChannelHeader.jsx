import { Flex, IconButton, useDisclosure } from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider";
import { FaBars } from "react-icons/fa";

import { SideDrawer } from "./SideDrawer";

import ChannelListHeader from "../channelList/ChannelListHeader";
import EntryCounter from "../channel/EntryCounter";
import GameTimer from "../channel/GameTimer";

export const ChannelHeader = ({ mode, showJoinedCh, setShowJoinedCh }) => {
  const { isMobile } = useUserState();
  const sideDrawer = useDisclosure();

  const modeConfig = {
    channelList: (
      <ChannelListHeader
        showJoinedCh={showJoinedCh} setShowJoinedCh={setShowJoinedCh}
      />
    ),
    channel: <EntryCounter />,
    game: <GameTimer />,
  };
  
  return(
    <Flex alignItems="center" w="100%" p={3}>
      {isMobile &&
        <>
          <IconButton
            size="sm"
            bg="white"
            icon={<FaBars />}
            aria-label="サイドメニューを開く"
            onClick={sideDrawer.onOpen}
          />
          <SideDrawer
            mode={mode}
            isOpen={sideDrawer.isOpen}
            onClose={sideDrawer.onClose}
          />
        </>
      }
      <Flex justifyContent="space-between" alignItems="center" w="100%">
        {modeConfig[mode]}
      </Flex>
    </Flex>
  );
};