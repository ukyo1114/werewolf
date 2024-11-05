import React, { useState, useEffect, useCallback } from "react";
import {
  Box, ModalBody, Avatar, Divider,
} from "@chakra-ui/react";
import axios from "axios";
import { useUserState } from "../../../context/userProvider";
import { errors, messages } from "../../../messages";
import {
  SelectableBox, StyledText, EllipsisText, ModalButton,
} from "../../miscellaneous/CustomComponents";
import { PHASE_MAP, RESULT_MAP } from "../../../constants";
import useNotification from "../../../hooks/notification";
import useJoinGame from "../../../hooks/useJoinGame";

const SpectatorModal = () => {
  const { user, currentChannel } = useUserState();
  const [gameList, setGameList] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const { _id: channelId } = currentChannel;
  const showToast = useNotification();
  const joinGame = useJoinGame();

  const fetchGameList = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `api/spectate/game-list/${channelId}`,
        config,
      );
      
      setGameList(data);
    } catch (error) {
      showToast(
        error?.response?.data?.error || errors.FETCH_GAME_LIST, "error"
      );
    }
  }, [user.token, channelId, setGameList, showToast]);

  useEffect(() => {
    fetchGameList();
  }, [fetchGameList]);

  return (
      <ModalBody>
        <Box display="flex" flexDir="column" p={3} maxH="800px" overflowY="auto">
          {gameList.length > 0 ? (
            gameList.map((game) => {
              const {
                gameId, players, currentDay, currentPhase, result
              } = game;

              return (
              <SelectableBox
                key={gameId}
                borderColor={selectedGame === gameId ? "white" : "#E17875"}
                bg={selectedGame === gameId ? "#E17875" : "#2B2024"}
                _hover={{
                  bg: selectedGame !== gameId ? "#3B2C2F" : undefined,
                }}
                onClick={() => setSelectedGame(gameId)}
              >
                <Box display="flex" flexDir="column" width="100%" overflow="hidden">
                  <Box display="flex" px="2px" overflowX="hidden">
                    <EllipsisText mr={3}>{currentDay}日目</EllipsisText>
                    <EllipsisText mr={3}>{PHASE_MAP[currentPhase]}</EllipsisText>
                    <EllipsisText mr={3}>{RESULT_MAP[result]}</EllipsisText>
                  </Box>

                  <Divider
                    borderWidth={1}
                    borderColor={selectedGame === gameId ? "white" : "#E17875"}
                    mb={2}
                  />

                  <Box
                    display="flex"
                    width="100%"
                    gap="2px"
                    overflowX="auto"
                    px="2px"
                  >
                    {players.map((pl) => (
                      <Avatar
                        key={pl._id}
                        size="sm"
                        name={pl.name}
                        src={pl.pic}
                        borderRadius="md"
                      />
                    ))}
                  </Box>
                </Box>
              </SelectableBox>
            )})
          ) : (
            <StyledText>{messages.NO_ACTIVE_GAME}</StyledText>
          )}
        </Box>
        <ModalButton
          isDisabled={!selectedGame}
          onClick={() => joinGame(selectedGame)}
        >
          観戦
        </ModalButton>
      </ModalBody>
  );
};

export default SpectatorModal