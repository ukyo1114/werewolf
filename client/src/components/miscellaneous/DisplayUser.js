import { Text,  Avatar } from "@chakra-ui/react";

const DisplayUser = ({ user }) => {
  return (
    <>
      <Avatar
        size="lg"
        name={user.name}
        src={user.pic}
        borderRadius="lg"
        mr={5}
      />
      
      <Text fontSize="lg">{user.name}</Text>

      {user.status && (
        <Text fontSize="lg">
          {user.status === "alive" ? "生存" : "死亡"}
        </Text>
      )}
    </>
  )
};

export default DisplayUser;