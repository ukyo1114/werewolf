import { Image, ModalBody } from "@chakra-ui/react";
import React from "react";
import { useUserState } from "../../context/UserProvider.jsx";

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
    </ModalBody>
  );
};

export default ProfileModal;
