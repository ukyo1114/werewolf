import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useUserState } from "../../context/userProvider";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user } = useUserState();

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent height="410px">
        <ModalHeader
          fontSize="40px"
          fontFamily="monospace"
          d="flex"
          justifyContent="center"
        >
          {user.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="space-between"
        >
          <Image
            borderRadius="lg"
            boxSize="150px"
            src={user.pic}
            alt={user.name}
          />
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            fontFamily="monospace"
          >
            Email: {user.email}
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProfileModal;
