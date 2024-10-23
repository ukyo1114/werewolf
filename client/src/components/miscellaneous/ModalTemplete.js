import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from "@chakra-ui/react";
import "../styles.css";

const ModalTemplete = ({ children, isOpen, onClose, title }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent
        bg="#2B2024"
        borderWidth={2}
        borderColor="#E17875"
        boxShadow="0px 0px 15px 5px rgba(255, 255, 255, 0.1)"
        maxHeight="1000px"
        overflowY="auto"
      >
        <ModalHeader
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="2xl"
          color="#ff94b1"
        >
          {title && title}
        </ModalHeader>
        <ModalCloseButton
          color="#ff94b1"
          _hover={{ bg: "#3B2C2F" }}
        />
        {children}
      </ModalContent>
    </Modal>
  );
};

export default ModalTemplete;
