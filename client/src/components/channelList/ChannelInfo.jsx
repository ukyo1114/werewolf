import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  ModalBody,
  ModalFooter,
  FormControl,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider.jsx";
import { useJoinChannel } from "../../hooks/useJoinChannel";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";

const ChannelInfo = ({ selectedChannel }) => {
  const { user } = useUserState();
  const [password, setPassword] = useState("");
  const joinChannel = useJoinChannel();

  return (
    <>        
      <ModalBody>
        <Box p={4} w="100%" borderRadius="lg" boxShadow="uniform">
          <Text textAlign="center" fontSize="lg" mb={1}>
            チャンネル名： {selectedChannel.channelName}
          </Text>
          <Divider borderWidth={1} borderColor="gray.700" mb={2} />
          <Box mb={3} maxH="600px" overflowY="auto">
            <Text mb={2} whiteSpace="pre-wrap">
              {selectedChannel.description}
            </Text>
          </Box>

          <Flex width="100%" justifyContent="space-between">
            <EllipsisText fontSize="sm" color="red.700">
              <strong>作成者：</strong> {selectedChannel.channelAdmin.name}
            </EllipsisText>
            <EllipsisText fontSize="sm" color="red.700">
              <strong>参加者数：</strong> {selectedChannel.users.length}人
            </EllipsisText>
          </Flex>
        </Box>
        {selectedChannel.hasPassword &&
          !selectedChannel.users.some((u) => u === user._id) && (
            <FormControl id="password">
              <Input
                placeholder="パスワード"
                mt={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
          )}
      </ModalBody>
      
      <ModalFooter>
          <Button
            data-testid="enter-button" // テスト用
            colorScheme={
              selectedChannel.blockUsers.some((u) => u === user._id) ? "pink" : "teal"
            }
            width="100%"
            onClick={() => joinChannel(selectedChannel._id, password)}
            isDisabled={selectedChannel.blockUsers.some(
              (u) => u === user._id,
            )}
          >
            {selectedChannel.blockUsers.some((u) => u === user._id)
              ? "ブロックされています"
              : "入室"}
          </Button>
      </ModalFooter>
    </>
  );
};

export default ChannelInfo;
