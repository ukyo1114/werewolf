import { Box, Avatar } from "@chakra-ui/react";
import { StyledDivider, EllipsisText } from "./CustomComponents.jsx";

const DisplayUser = ({ children, user, ...props }) => {
  return (
    <Box
      display="flex"
      alignItems={children ? "flex-start" : "center"}
      w="100%"
      p={4}
      borderRadius="lg"
      boxShadow="uniform"
      {...props}
    >
      <Avatar
        size="lg"
        name={user.name}
        src={user.pic}
        borderRadius="lg"
        mt={children && 1}
        mr={4}
      />
      <Box display="flex" flexDir="column" width="100%" overflowX="hidden">
        <EllipsisText fontSize="lg">{user.name}</EllipsisText>
        {children && <StyledDivider />}
        {children}
      </Box>
    </ Box>
  )
};

export default DisplayUser;