import React from "react";
import { Box } from "@chakra-ui/react";
import ProfileMenu from "../profile/ProfileMenu";

const Sidebar = ({ Component }) => {
  return (
    <Box
      display="flex"
      px={2}
      flexDirection="column"
      alignItems="center"
      overflowY="auto"
      justifyContent="space-between"
      borderLeftWidth={4}
      borderColor="#E17875"
    >
      {Component && <Component />}
      <Box mt="auto" >
        <ProfileMenu />
      </Box>
    </Box>
  );
};

export default Sidebar;
