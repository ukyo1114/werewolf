import React from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton
} from "@chakra-ui/react";

const ModalTemplete = ({ children, isOpen, onClose, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent maxHeight="100vh" overflowY="auto">
        <ModalHeader
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="2xl"
          color="gray.700"
        >
          {title && title}
        </ModalHeader>
        <ModalCloseButton />
        {children}
      </ModalContent>
    </Modal>
  );
};

export default ModalTemplete;
