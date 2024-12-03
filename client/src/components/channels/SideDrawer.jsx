import { Suspense, lazy } from "react";
import { Drawer, DrawerOverlay, DrawerContent } from "@chakra-ui/react";

import ChannelListSidebar from "../channelList/ChannelListSidebar";

const ChannelSidebar = lazy(() => import("../channelSideBar/ChannelSidebar"));
const GameSidebar = lazy(() => import("../gameSidebar/GameSidebar"));

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
      <Suspense fallback={<div>Loading...</div>}>{modeConfig[mode]}</Suspense>
    </DrawerContent>
  </Drawer>
  );
};

export default SideDrawer;