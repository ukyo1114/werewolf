import { ModalBody } from "@chakra-ui/react";
import React from "react";
import { useUserState } from "../../context/UserProvider.jsx";
import { StyledBox } from "../miscellaneous/CustomComponents.jsx";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";

const ProfileModal = () => {
  const { user } = useUserState();

  return (
    <ModalBody>
      <DisplayUser key={user._id} user={user} />
    </ModalBody>
  );
};

export default ProfileModal;
