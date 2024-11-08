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
import "../styles.css";
import { useUserState } from "../../context/UserProvider.jsx";
import { useJoinChannel } from "../../hooks/useJoinChannel";

const ChannelInfo = ({ selectedChannel }) => {
  const { user } = useUserState();
  const [password, setPassword] = useState("");
  const joinChannel = useJoinChannel();

  return (
    <>        
      <ModalBody>
        <Box
          p={3}
          mb={4}
          w="100%"
          borderRadius="lg"
          bg="#3B2C2F"
        >
          <Text textAlign="center" fontWeight="bold" fontSize="lg" mb={1}>
            チャンネル名： {selectedChannel.channelName}
          </Text>
          <Divider borderWidth={1} borderColor="#E17875" mb={2} />
          <Box mb={3} maxH="600px" overflowY="auto" className="custom-scrollbar">
            <Text mb={2} whiteSpace="pre-wrap">
              {selectedChannel.description}
            </Text>
          </Box>

          <Flex width="100%" justifyContent="space-between">
            <Text fontSize="sm" color="#ff94b1">
              <strong>作成者：</strong> {selectedChannel.channelAdmin.name}
            </Text>
            <Text fontSize="sm" color="#ff94b1">
              <strong>参加者数：</strong> {selectedChannel.users.length}人
            </Text>
          </Flex>
        </Box>
        {selectedChannel.hasPassword &&
          !selectedChannel.users.some((u) => u === user._id) && (
            <FormControl id="password">
              <Input
                placeholder="パスワード"
                mb={3}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="#3B2C2F"
                borderColor="#E17875"
                _placeholder={{ color: "gray.200" }}
              />
            </FormControl>
          )}
      </ModalBody>
      
      <ModalFooter justifyContent="center">
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
