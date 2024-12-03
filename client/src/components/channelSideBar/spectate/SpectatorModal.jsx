import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import {
  Flex, Stack, Avatar, Divider,
} from "@chakra-ui/react";


import { useUserState } from "../../../context/UserProvider.jsx";
import { errors, messages } from "../../../messages";
import {
  SelectableBox, StyledText, EllipsisText,
} from "../../miscellaneous/CustomComponents.jsx";
import { PHASE_MAP, RESULT_MAP } from "../../../constants";
import useNotification from "../../../hooks/useNotification";
import useJoinGame from "../../../hooks/useJoinGame";
import ModalButton from "../../miscellaneous/ModalButton.jsx";

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
    <Stack w="100%" overflow="hidden">
      <Stack w="100%" p={2} gap={4} overflow="auto">
        {gameList.length > 0 ? (
          gameList.map((game) => {
            const {
              gameId, players, currentDay, currentPhase, result
            } = game;

            return (
            <SelectableBox
              key={gameId}
              bg={selectedGame === gameId ? "green.100" : "white"}
              _hover={{
                bg: selectedGame !== gameId ? "gray.200" : undefined,
              }}
              onClick={() => setSelectedGame(gameId)}
            >
              <Stack width="100%" overflow="hidden">
                <Flex px="2px" overflowX="hidden">
                  <EllipsisText mr={3}>{currentDay}日目</EllipsisText>
                  <EllipsisText mr={3}>{PHASE_MAP[currentPhase]}</EllipsisText>
                  <EllipsisText mr={3}>{RESULT_MAP[result]}</EllipsisText>
                </Flex>

                <Divider borderWidth={1} borderColor="gray.700" mb={2} />

                <Flex
                  width="100%"
                  gap="2px"
                  overflowX="auto"
                  px="2px"
                >
                  {players.map((pl) => (
                    <Avatar
                      key={pl._id}
                      size="sm"
                      src={pl.pic}
                      borderRadius="md"
                    />
                  ))}
                </Flex>
              </Stack>
            </SelectableBox>
          )})
        ) : (
          <StyledText>{messages.NO_ACTIVE_GAME}</StyledText>
        )}
      </Stack>

      <ModalButton
        isDisabled={!selectedGame} onClick={() => joinGame(selectedGame)}
      >
        観戦
      </ModalButton>
    </Stack>
  );
};

export default SpectatorModal
