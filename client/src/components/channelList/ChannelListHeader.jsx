import React from "react";
import { Checkbox, useDisclosure } from "@chakra-ui/react";
import {
  ChannelHeader, HeaderContents, EllipsisText, BarsButton, SideMenu,
} from "../miscellaneous/CustomComponents.jsx";
import SideBar from "../miscellaneous/SideBar.jsx"
import ChannelListSidebar from "./ChannelListSidebar.jsx"
import { useUserState } from "../../context/UserProvider.jsx";


const ChannelListHeader = ({ showJoinedCh, setShowJoinedCh }) => {
  const { isMobile } = useUserState();
  const sideMenu = useDisclosure();

  return (
    <ChannelHeader>
      {isMobile &&
        <>
          <BarsButton onClick={sideMenu.onOpen} />
          <SideMenu isOpen={sideMenu.isOpen} onClose={sideMenu.onClose}>
            <SideBar><ChannelListSidebar /></SideBar>
          </SideMenu>
        </>
      }
      <HeaderContents>
        <EllipsisText fontSize="lg" fontWeight="bold" color="gray.700">
          チャンネルリスト
        </EllipsisText>

        <Checkbox
          id="isJoined"
          isChecked={showJoinedCh}
          onChange={(e) => setShowJoinedCh(e.target.checked)}
        >
          <EllipsisText>参加中のみ</EllipsisText>
        </Checkbox>
      </HeaderContents>

    </ChannelHeader>
  );
};

export default ChannelListHeader;