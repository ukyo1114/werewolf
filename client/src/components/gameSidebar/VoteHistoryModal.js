import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ModalFooter,
  Text,
  Image,
  Flex,
  useToast,
} from "@chakra-ui/react";
import "../styles.css";
import { useUserState } from "../../context/userProvider";
import axios from "axios";

const VoteHistoryModal = ({ isOpen, onClose, mode }) => {
  const modeConfig = {
    others: {
      tabs: ["投票"],
      components: [<VoteHistory key="vote" />],
    },
    fortune: {
      tabs: ["投票", "占い"],
      components: [<VoteHistory key="vote" />, <FortuneResult key="fortune" />],
    },
    medium: {
      tabs: ["投票", "霊能"],
      components: [<VoteHistory key="vote" />, <MediumResult key="medium" />],
    },
    guard: {
      tabs: ["投票", "護衛"],
      components: [<VoteHistory key="vote" />, <GuardHistory key="guard" />],
    },
    attack: {
      tabs: ["投票", "襲撃"],
      components: [<VoteHistory key="vote" />, <AttackHistory key="attack" />],
    },
  };

  const { tabs, components } = modeConfig[mode] || modeConfig["others"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>ゲームログ</ModalHeader>
        <ModalBody>
          <Tabs>
            <TabList>
              {tabs.map((tabName) => (
                <Tab key={tabName} w={`${100 / tabs.length}%`}>
                  {tabName}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {components.map((Component, index) => (
                <TabPanel key={index}>{Component}</TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Flex width="100%" justifyContent="space-evenly">
            <Button onClick={onClose}>Close</Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const VoteHistory = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [voteHistory, setVoteHistory] = useState({});
  const toast = useToast();

  const fetchVoteHistory = useCallback(async () => {
    if (gameState.phase && gameState.phase.currentPhase !== "pre") {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/game/vote-history/${gameState.gameId}`,
          config,
        );
        setVoteHistory(data);
      } catch (error) {
        toast({
          title: "エラー発生！",
          description:
            error.response?.data?.message ||
            "投票履歴の取得に失敗したようです。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }, [user.token, gameState, setVoteHistory, toast]);

  useEffect(() => {
    fetchVoteHistory();
  }, [fetchVoteHistory, gameState?.phase]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {Object.entries(voteHistory).length > 0 ? (
        Object.entries(voteHistory)
          .reverse()
          .map(([day, vote]) => (
            <Box key={day}>
              <Text>{day}日目</Text>
              <Box
                display="flex"
                flexDir="column"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="lg"
              >
                {Object.entries(vote).map(([votee, voters]) => {
                  const user = currentChannel.users.find((u) => u._id === votee);
                  return user ? (
                    <Box
                      key={user._id}
                      display="flex"
                      alignItems="center"
                      mb={3}
                      p={3}
                      borderRadius="md"
                      bg="white"
                    >
                      <Image
                        src={user.pic}
                        alt={user.name}
                        boxSize={16}
                        borderRadius="md"
                        mr={5}
                      />
                      <Text fontSize="lg">{user.name}</Text>
                      {voters.map((voter) => {
                        const voteUser = currentChannel.users.find(
                          (u) => u._id === voter,
                        );
                        return voteUser ? (
                          <Text key={voteUser._id} fontSize="lg">
                            {voteUser.name}
                          </Text>
                        ) : null;
                      })}
                    </Box>
                  ) : null;
                })}
              </Box>
            </Box>
          ))
      ) : (
        <Text>投票履歴が無いようです。</Text>
      )}
    </Box>
  );
};

const FortuneResult = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [fortuneResult, setFortuneResult] = useState({});
  const toast = useToast();

  const fetchFortuneResult = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "seer"
    ) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/game/fortune-result/${gameState.gameId}`,
          config,
        );
        setFortuneResult(data);
      } catch (error) {
        toast({
          title: "エラー発生！",
          description:
            error.response?.data?.message ||
            "占い結果の取得に失敗したようです。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }, [user, gameState, setFortuneResult, toast]);

  useEffect(() => {
    fetchFortuneResult();
  }, [fetchFortuneResult, gameState?.phase?.currentDay]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {fortuneResult && Object.entries(fortuneResult).length > 0 ? (
        Object.entries(fortuneResult)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day}>
                <Text>{day}日目</Text>
                <Box
                  display="flex"
                  flexDir="column"
                  p={3}
                  bg="#E8E8E8"
                  w="100%"
                  h="100%"
                  borderRadius="lg"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={3}
                    p={3}
                    borderRadius="md"
                    bg="white"
                  >
                    <Image
                      src={player.pic}
                      alt={player.name}
                      boxSize={16}
                      borderRadius="md"
                      mr={5}
                    />
                    <Text fontSize="lg">{player.name}</Text>
                    {(() => {
                      const teams = {
                        unknown: "不明",
                        villagers: "村人",
                        werewolves: "人狼",
                      };
                      return <Text fontSize="lg">{teams[result.team]}</Text>;
                    })()}
                  </Box>
                </Box>
              </Box>
            ) : null;
          })
      ) : (
        <Text>占い結果が無いようです。</Text>
      )}
    </Box>
  );
};

const MediumResult = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [mediumResult, setMediumResult] = useState({});
  const toast = useToast();

  const fetchMediumResult = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "medium"
    ) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/game/medium-result/${gameState.gameId}`,
          config,
        );
        setMediumResult(data);
      } catch (error) {
        toast({
          title: "エラー発生！",
          description:
            error.response?.data?.message ||
            "霊能結果の取得に失敗したようです。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }, [user, gameState, setMediumResult, toast]);

  useEffect(() => {
    fetchMediumResult();
  }, [fetchMediumResult, gameState?.phase?.currentDay]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {mediumResult && Object.entries(mediumResult).length > 0 ? (
        Object.entries(mediumResult)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day}>
                <Text>{day}日目</Text>
                <Box
                  display="flex"
                  flexDir="column"
                  p={3}
                  bg="#E8E8E8"
                  w="100%"
                  h="100%"
                  borderRadius="lg"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={3}
                    p={3}
                    borderRadius="md"
                    bg="white"
                  >
                    <Image
                      src={player.pic}
                      alt={player.name}
                      boxSize={16}
                      borderRadius="md"
                      mr={5}
                    />
                    <Text fontSize="lg">{player.name}</Text>
                    {(() => {
                      const teams = {
                        unknown: "不明",
                        villagers: "村人",
                        werewolves: "人狼",
                      };
                      return <Text fontSize="lg">{teams[result.team]}</Text>;
                    })()}
                  </Box>
                </Box>
              </Box>
            ) : null;
          })
      ) : (
        <Text>霊能結果が無いようです。</Text>
      )}
    </Box>
  );
};

const GuardHistory = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [guardHistory, setGuardHistory] = useState({});
  const toast = useToast();

  const fetchGuardHistory = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "hunter"
    ) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/game/guard-history/${gameState.gameId}`,
          config,
        );
        setGuardHistory(data);
      } catch (error) {
        toast({
          title: "エラー発生！",
          description:
            error.response?.data?.message ||
            "護衛履歴の取得に失敗したようです。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }, [user, gameState, setGuardHistory, toast]);

  useEffect(() => {
    fetchGuardHistory();
  }, [fetchGuardHistory, gameState?.phase?.currentDay]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {guardHistory && Object.entries(guardHistory).length > 0 ? (
        Object.entries(guardHistory)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day}>
                <Text>{day}日目</Text>
                <Box
                  display="flex"
                  flexDir="column"
                  p={3}
                  bg="#E8E8E8"
                  w="100%"
                  h="100%"
                  borderRadius="lg"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={3}
                    p={3}
                    borderRadius="md"
                    bg="white"
                  >
                    <Image
                      src={player.pic}
                      alt={player.name}
                      boxSize={16}
                      borderRadius="md"
                      mr={5}
                    />
                    <Text fontSize="lg">{player.name}</Text>
                  </Box>
                </Box>
              </Box>
            ) : null;
          })
      ) : (
        <Text>護衛履歴が無いようです。</Text>
      )}
    </Box>
  );
};

const AttackHistory = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [attackHistory, setAttackHistory] = useState({});
  const toast = useToast();

  const fetchAttackHistory = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "werewolf"
    ) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/game/attack-history/${gameState.gameId}`,
          config,
        );
        setAttackHistory(data);
      } catch (error) {
        toast({
          title: "エラー発生！",
          description:
            error.response?.data?.message ||
            "襲撃履歴の取得に失敗したようです。",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }, [user, gameState, setAttackHistory, toast]);

  useEffect(() => {
    fetchAttackHistory();
  }, [fetchAttackHistory, gameState?.phase?.currentDay]);

  return (
    <Box
      display="flex"
      flexDir="column"
      p={3}
      bg="#E8E8E8"
      w="100%"
      h="100%"
      borderRadius="lg"
    >
      {attackHistory && Object.entries(attackHistory).length > 0 ? (
        Object.entries(attackHistory)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day}>
                <Text>{day}日目</Text>
                <Box
                  display="flex"
                  flexDir="column"
                  p={3}
                  bg="#E8E8E8"
                  w="100%"
                  h="100%"
                  borderRadius="lg"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={3}
                    p={3}
                    borderRadius="md"
                    bg="white"
                  >
                    <Image
                      src={player.pic}
                      alt={player.name}
                      boxSize={16}
                      borderRadius="md"
                      mr={5}
                    />
                    <Text fontSize="lg">{player.name}</Text>
                  </Box>
                </Box>
              </Box>
            ) : null;
          })
      ) : (
        <Text>襲撃履歴が無いようです。</Text>
      )}
    </Box>
  );
};

export default VoteHistoryModal;
