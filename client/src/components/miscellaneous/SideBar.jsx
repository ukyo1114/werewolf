import React from "react";
import { Box } from "@chakra-ui/react";
import ProfileMenu from "../profile/ProfileMenu.jsx";

const Sidebar = ({ Component }) => {
  return (
    <Box
      display="flex"
      px={3}
      flexDirection="column"
      alignItems="center"
      overflowY="auto"
      justifyContent="space-between"
      width={{ lg: "300px" }}
    >
      {Component && <Component />}
      
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

export default Sidebar;
