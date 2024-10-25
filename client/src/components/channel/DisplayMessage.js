import { Box, Flex, Text, Avatar } from "@chakra-ui/react";

const DisplayMessage = ({ message, user }) => {
  const messageBg = {
    werewolf: "#FFCCCB",
    spectator: "#DBD0D4",
  };

  return (
    <Box display="flex" my={2} gap={1}>
      <Avatar
        size="lg"
        src={user.pic}
        borderRadius="md"
      />

      <Flex direction="column" width="100%">
        <Flex justify="space-between" align="center" width="100%" px={2}>
          <Text fontWeight="bold">{user.name}</Text>
            <Text fontWeight="bold">
              {new Date(message.createdAt).toLocaleString()}
          </Text>
        </Flex>

        <Box
          bg={messageBg[message.messageType] || "white"}
          borderRadius="lg"
          px={4}
          py={2}
          width="100%"
        >
          <Text color="black" whiteSpace="pre-wrap">{message.content}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default DisplayMessage;