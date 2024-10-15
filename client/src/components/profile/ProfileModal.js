import {
  Image,
  ModalBody,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useUserState } from "../../context/userProvider";

const ProfileModal = () => {
  const { user } = useUserState();

  return (
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
  );
};

export default ProfileModal;
