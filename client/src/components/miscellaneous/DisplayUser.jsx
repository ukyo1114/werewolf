import { Flex, Avatar } from "@chakra-ui/react";
import { StyledDivider, EllipsisText } from "./CustomComponents.jsx";

const DisplayUser = ({ children, user, ...props }) => {
  return (
    <Flex
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
      <Flex flexDir="column" width="100%" overflowX="hidden">
        <EllipsisText fontSize="lg">{user.name}</EllipsisText>
        {children && <StyledDivider />}
        {children}
      </Flex>
    </ Flex>
  )
};

export default DisplayUser;