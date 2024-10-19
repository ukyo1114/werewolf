import React from "react";
import { Box, Tooltip,  Button, Text, useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import CreateChannel from "./CreateChannel";
import ModalTemplete from "../miscellaneous/ModalTemplete";

const ChannelListSidebar = () => {
  const createChModal = useDisclosure();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={{ base: 'center', lg: 'flex-start' }}
      width="100%"
    >
      <Tooltip label="チャンネル作成" placement="bottom-end">
        <Button
          variant="ghost"
          my={2}
          onClick={createChModal.onOpen}
        >
          <FaPlus size="30px" color="#E17875" />
          <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
            チャンネル作成
          </Text>
        </Button>
      </Tooltip>

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
