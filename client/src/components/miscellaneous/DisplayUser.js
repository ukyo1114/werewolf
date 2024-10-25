import { Box, Text,  Avatar } from "@chakra-ui/react";
import { StyledDivider } from "./CustomComponents";

const DisplayUser = ({ children, user }) => {
  return (
    <Box display="flex" width="100%" alignItems={children ? "flex-start" : "center"}>
      <Avatar
        size="lg"
        name={user.name}
        src={user.pic}
        borderRadius="lg"
        mt={children && 1}
        mr={4}
      />
      <Box display="flex" flexDir="column" width="100%">
        <Text fontSize="lg">{user.name}</Text>
        {children && <StyledDivider />}
        {children}
      </Box>
{/* 
      {user.status && (
        <Text fontSize="lg">
          {user.status === "alive" ? "生存" : "死亡"}
        </Text>
      )} */}
    </ Box>
  )
};

export default DisplayUser;