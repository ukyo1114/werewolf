import { Box, Image, Text, Spinner } from "@chakra-ui/react";
import { useUserState } from "../context/UserContext.jsx";
import useFetchGameList from "../hooks/useFetchGameList";
import { PHASE_MAP, RESULT_MAP } from "../constants";

const GameSelector = ({ setSelectedGame }) => {
  const { user, currentChannel } = useUserState();
  const { gameList, isLoading, fetchGameList } = useFetchGameList(
    user.token,
    currentChannel._id
  );

  useEffect(() => fetchGameList(), [fetchGameList]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
      overflowY="auto"
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <Spinner size="lg" color="blue.500" />
        </Box>
      ) : gameList.length === 0 ? (
        <Text fontSize="lg" color="gray.600" textAlign="center" mt={5}>
          進行中のゲームがありません
        </Text>
      ) : (
        gameList.map((game) => {
          const players = game.players
            .map((playerId) =>
              currentChannel.users.find((u) => u._id === playerId)
            )
            .filter(Boolean);

          return (
            <Box
              key={game.gameId}
              display="flex"
              flexDir="column"
              p={4}
              mb={4}
              borderRadius="md"
              bg="white"
              boxShadow="md"
              cursor="pointer"
              onClick={() => setSelectedGame(game.gameId)}
              _hover={{ bg: "blue.50" }}
            >
              <Box display="flex"  mb={2}>
                <Text fontSize="md" color="gray.500">
                  {game.currentDay}日目 - {PHASE_MAP[game.currentPhase]}
                </Text>
              </Box>
              {RESULT_MAP[game.result] && (
                <Text mb={2} color="green.500" fontWeight="bold">
                  {RESULT_MAP[game.result]}
                </Text>
              )}

              <Box display="flex" flexWrap="wrap">
                {players.map((player) => (
                  <Image
                    key={player._id}
                    src={player.pic}
                    alt={player.name}
                    boxSize="sm"
                    borderRadius="full"
                    mr={2}
                    mb={2}
                  />
                ))}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default GameSelector; 