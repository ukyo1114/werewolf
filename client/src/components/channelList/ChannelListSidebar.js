import React from "react";
import { Box, Button, Text, useDisclosure } from "@chakra-ui/react";
import { FaUsers } from "react-icons/fa";
import CreateChannel from "./CreateChannel";
import ModalTemplete from "../miscellaneous/ModalTemplete";

const ChannelListSidebar = () => {
  const createChModal = useDisclosure();

  return (
    <Box>
      <Button
        variant="ghost"
        my={2}
        onClick={createChModal.onOpen}
      >
        <FaUsers size="30px" color="#E17875" />
        <Text display={{ base: "none", lg: "flex" }} ml={3}>
          チャンネル作成
        </Text>
      </Button>
      <ModalTemplete
        isOpen={createChModal.isOpen}
        onClose={createChModal.onClose}
        title={"チャンネル作成"}
        Contents={CreateChannel}
      />
    </Box>
  );
};

export default ChannelListSidebar;
