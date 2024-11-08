import React from "react";
import { useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import CreateChannel from "./CreateChannel.jsx";
import ModalTemplete from "../miscellaneous/ModalTemplete.jsx";
import {
  SidebarBox,
  SidebarButton,
  iconProps,
} from "../miscellaneous/CustomComponents.jsx";

const ChannelListSidebar = () => {
  const createChannel = useDisclosure();

  return (
    <SidebarBox>
      <SidebarButton label="チャンネル作成" onClick={createChannel.onOpen}>
        <FaPlus {...iconProps} />
      </SidebarButton>

      <ModalTemplete
        isOpen={createChannel.isOpen}
        onClose={createChannel.onClose}
        title={"チャンネル作成"}
      >
        <CreateChannel />
      </ModalTemplete>
    </SidebarBox>
  );
};

export default ChannelListSidebar;
