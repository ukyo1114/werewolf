import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  Input,
  Flex,
  Text,
} from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/userProvider";
import useNotification from "../../hooks/notification";
import { errors } from "../../messages";

const ChannelInfo = ({ isOpen, onClose, selectedChannel }) => {
  const { user, setCurrentChannel } = useUserState();
  const [password, setPassword] = useState("");
  const showToast = useNotification();

  const handleOnClick = async () => {
    if (selectedChannel.blockUsers.some((u) => u === user._id)) {
      showToast(errors.USER_BLOCKED, "error");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data } = await axios.post(
        "/api/channel/enter",
        {
          channelId: selectedChannel._id,
          password: password,
        },
        config,
      );
      setCurrentChannel(data);
    } catch (error) {
      showToast(error?.response?.data?.message || errors.CHANNEL_ENTER_FAILED, "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{selectedChannel.channelName}</ModalHeader>
        <ModalBody>
          <Box pb={3} px={3} mb={4} w="100%" bg="gray.100" borderRadius="md">
            <Text fontWeight="bold" fontSize="lg" mb={2}>
              説明
            </Text>
            <Box maxH="600px" overflowY="auto" className="custom-scrollbar">
              <Text mb={2} whiteSpace="pre-wrap">
                {selectedChannel.description}
              </Text>
            </Box>
          </Box>
          {selectedChannel.hasPassword &&
            !selectedChannel.users.some((u) => u === user._id) && (
              <FormControl id="password">
                <Input
                  placeholder="パスワード"
                  mb={3}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
            )}
          <Flex width="100%" justifyContent="space-between">
            <Text>
              <strong>人数:</strong> {selectedChannel.users.length}
            </Text>
            <Text>
              <strong>作成者:</strong> {selectedChannel.channelAdmin.name}
            </Text>
          </Flex>
          {selectedChannel.blockUsers.some((u) => u === user._id) && (
            <Text fontWeight="bold" color="red.500">
              ブロックされています。
            </Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Flex width="100%" justifyContent="space-evenly">
            <Button onClick={onClose}>Close</Button>
            <Button
              colorScheme="twitter"
              onClick={handleOnClick}
              isDisabled={selectedChannel.blockUsers.some(
                (u) => u === user._id,
              )}
            >
              OK
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ChannelInfo;
