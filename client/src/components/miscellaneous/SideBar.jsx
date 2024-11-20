import React from "react";
import { Box } from "@chakra-ui/react";
import ProfileMenu from "../profile/ProfileMenu.jsx";

const SideBar = ({ children }) => {
  return (
    <Box
      display="flex"
      px={3}
      flexDirection="column"
      alignItems="center"
      overflowY="auto"
      justifyContent="space-between"
      h="100%"
    >
      {children}
      <Box
        mt="auto"
        display="flex"
        justifyContent="center"
        mb={4}
        width="100%"
      >
        <ProfileMenu />
      </Box>
    </Box>
  );
};

export default SideBar;
