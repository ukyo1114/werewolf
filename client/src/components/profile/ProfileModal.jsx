import { Stack } from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import DisplayUser from "../miscellaneous/DisplayUser.jsx";

const ProfileModal = () => {
  const { user } = useUserState();

  return (
    <Stack w="100%" p={2} overflow="auto">
      <DisplayUser key={user._id} user={user} />
    </Stack>
  );
};

export default ProfileModal;
