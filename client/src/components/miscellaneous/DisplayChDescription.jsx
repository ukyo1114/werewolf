import { Stack, Divider, Text } from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";

export const DisplayChDescription = () => {
  const { currentChannel } = useUserState();
  const { channelName, description } = currentChannel;

  return (
    <Stack overflow="hidden">
      <Text textAlign="center">
        タイトル： {channelName}
      </Text>

      <Divider borderWidth={1} borderColor="gray.700" />

      <Text overflow="auto" whiteSpace="pre-wrap">
        {description}
      </Text>
    </Stack>
  );
};
