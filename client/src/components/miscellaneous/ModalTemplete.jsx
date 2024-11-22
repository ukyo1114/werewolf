import React from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton
} from "@chakra-ui/react";
import { EllipsisText } from "./CustomComponents";

const ModalTemplete = ({ children, isOpen, onClose, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent maxHeight="80vh" overflowY="auto">
        <ModalHeader
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="2xl"
          color="gray.700"
        >
          <EllipsisText>{title && title}</EllipsisText>
        </ModalHeader>
        <ModalCloseButton />
        {children}
      </ModalContent>
    </Modal>
  );
};

export default ModalTemplete;
