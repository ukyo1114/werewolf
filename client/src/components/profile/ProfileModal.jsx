import { ModalBody } from "@chakra-ui/react";
import React from "react";
import { useUserState } from "../../context/UserProvider.jsx";
import { StyledBox } from "../miscellaneous/CustomComponents.jsx";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";

const ProfileModal = () => {
  const { user } = useUserState();

  return (
    <ModalBody
      display="flex"
      flexDir="column"
      p={3}
      w="100%"
      h="100%"
      borderRadius="lg"
      mb={4}
    >
      <StyledBox key={user._id}>
        <DisplayUser user={user} />
      </StyledBox>
    </ModalBody>
  );
};

export default ProfileModal;
