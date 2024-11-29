import { useState } from "react";

import {
  Stack,
  Divider,
  FormControl,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";

import { useUserState } from "../../context/UserProvider.jsx";
import { useJoinChannel } from "../../hooks/useJoinChannel";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";
import ModalButton from "../miscellaneous/ModalButton.jsx";

const ChannelInfo = ({ selectedChannel }) => {
  const { user } = useUserState();
  const [password, setPassword] = useState("");
  const joinChannel = useJoinChannel();

  return (
    <Stack overflow="hidden">
      <Text textAlign="center">
        タイトル： {selectedChannel.channelName}
      </Text>

      <Divider borderWidth={1} borderColor="gray.700" />

      <Text overflow="auto" whiteSpace="pre-wrap">
        {selectedChannel.description}
      </Text>

      <Flex justifyContent="space-between">
        <EllipsisText fontSize="sm" color="red.500">
          作成者： {selectedChannel.channelAdmin.name}
        </EllipsisText>
        <EllipsisText fontSize="sm" color="red.500">
          参加者数： {selectedChannel.users.length}人
        </EllipsisText>
      </Flex>

      {selectedChannel.hasPassword &&
        !selectedChannel.users.some((u) => u === user._id) && (
          <FormControl id="password">
            <Input
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
      )}

      <ModalButton
        data-testid="enter-button"
        colorScheme={
          selectedChannel.blockUsers.some((u) => u === user._id) ?
          "pink" : "teal"
        }
        onClick={() => joinChannel(selectedChannel._id, password)}
        isDisabled={selectedChannel.blockUsers.some(
          (u) => u === user._id,
        )}
      >
        {selectedChannel.blockUsers.some((u) => u === user._id)
          ? "ブロックされています"
          : "入室"}
      </ModalButton>
    </Stack>
  );
};

export default ChannelInfo;
