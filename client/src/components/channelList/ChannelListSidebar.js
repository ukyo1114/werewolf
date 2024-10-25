import React from "react";
import { useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import CreateChannel from "./CreateChannel";
import ModalTemplete from "../miscellaneous/ModalTemplete";
import {
  SidebarBox,
  SidebarButton,
  iconProps,
} from "../miscellaneous/CustomComponents";

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
