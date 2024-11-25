import { Box, Flex, Text, Avatar } from "@chakra-ui/react";
import { EllipsisText } from "../miscellaneous/CustomComponents";

const DisplayMessage = ({ message, user }) => {
  const messageBg = {
    werewolf: "pink.100",
    spectator: "purple.100",
  };

  return (
    <Flex my={2} gap={1}>
      <Avatar
        size="lg"
        src={user.pic}
        borderRadius="md"
      />

      <Flex direction="column" width="100%">
        <Flex justify="space-between" align="center" width="100%" px={2}>
          <EllipsisText>{user.name}</EllipsisText>
            <EllipsisText fontSize="sm">
            {new Date(message.createdAt).toLocaleString("ja-JP", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </EllipsisText>
        </Flex>

        <Box
          bg={messageBg[message.messageType] || "green.100"}
          borderRadius="lg"
          px={4}
          py={2}
          width="100%"
        >
          <Text color="black" whiteSpace="pre-wrap">{message.content}</Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default DisplayMessage;