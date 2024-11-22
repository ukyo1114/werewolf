import { Drawer, DrawerOverlay, DrawerContent } from "@chakra-ui/react";

import ChannelListSidebar from "../channelList/ChannelListSidebar";
import ChannelSidebar from "../channelSideBar/ChannelSidebar";
import GameSidebar from "../gameSidebar/GameSidebar";

export const SideDrawer = ({ mode, isOpen, onClose }) => {
  const modeConfig = {
    channelList: <ChannelListSidebar />,
    channel: <ChannelSidebar />,
    game: <GameSidebar />,
  };

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
    <DrawerOverlay />
    <DrawerContent>
      {modeConfig[mode]}
    </DrawerContent>
  </Drawer>
  );
};