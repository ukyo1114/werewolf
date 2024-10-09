import React from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Image,
} from "@chakra-ui/react";
import "../styles.css";

const UserList = ({ isOpen, onClose, userList }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ユーザーリスト</ModalHeader>
        <ModalBody>
          <Box
            display="flex"
            flexDir="column"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
          >
            {userList.map((user) => (
              <Box key={user._id} display="flex" alignItems="center" mb={3}>
                <Image
                  src={user.pic}
                  alt={user.name}
                  boxSize={16}
                  borderRadius="md"
                  mr={5}
                />
                <Text fontSize="lg">{user.name}</Text>
                {user.status && (
                  <Text fontSize="lg">
                    {user.status === "alive" ? "生存" : "死亡"}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserList;
