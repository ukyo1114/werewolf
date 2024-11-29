import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
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
      <ModalContent maxH="80vh">
        <ModalHeader>
          <EllipsisText textAlign="center" fontSize="xl" color="gray.700">
            {title && title}
          </EllipsisText>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDir="column" overflow="auto">
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalTemplete;
