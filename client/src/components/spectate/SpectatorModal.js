import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Image,
  Flex,
} from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/userProvider";
import GameSelector from "./GameSelector";
import Game from "../../../../server/models/gameModel";

const SpectatorModal = ({ isOpen, onClose }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleOnClick = 

  const handleOnClose = useCallback(() => {
    setSelectedGame(null);
    onClose();
  }, [setSelectedGame, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleOnClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ブロック</ModalHeader>
        <ModalBody>
          <GameSelector
            setSelectedGame={setSelectedGame}
          />
        </ModalBody>
        <ModalFooter>
          <Flex width="100%" justifyContent="space-evenly">
            <Button onClick={handleOnClose}>Close</Button>
            <Button
              colorScheme="twitter"
              onClick={handleOnClick}
              isDisabled={!selectedGame}
            >
              投票
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SpectatorModal
