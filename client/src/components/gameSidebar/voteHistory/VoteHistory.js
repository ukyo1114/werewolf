import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  ModalBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import "../../styles.css";
import { useUserState } from "../../../context/userProvider";
import axios from "axios";
import DisplayUser from "../../miscellaneous/DisplayUser";
import useNotification from "../../../hooks/notification";
import { errors } from "../../../messages";
import {
  DisplayDay,
  StyledDivider,
  StyledBox,
  StyledText,
} from "../../miscellaneous/CustomComponents";


const VoteHistoryTabs = ({ mode }) => {
  const modeConfig = {
    others: {
      tabs: ["投票履歴"],
      components: [<VoteHistory key="vote" />],
    },
    fortune: {
      tabs: ["投票履歴", "占い結果"],
      components: [<VoteHistory key="vote" />, <FortuneResult key="fortune" />],
    },
    medium: {
      tabs: ["投票履歴", "霊能結果"],
      components: [<VoteHistory key="vote" />, <MediumResult key="medium" />],
    },
    guard: {
      tabs: ["投票履歴", "護衛履歴"],
      components: [<VoteHistory key="vote" />, <GuardHistory key="guard" />],
    },
    attack: {
      tabs: ["投票履歴", "襲撃履歴"],
      components: [<VoteHistory key="vote" />, <AttackHistory key="attack" />],
    },
  };

  const { tabs, components } = modeConfig[mode] || modeConfig["others"];

  return (
      <ModalBody>
        <Tabs variant="soft-rounded" mb={4}>
          <TabList>
            {tabs.map((tabName) => (
              <Tab
                key={tabName}
                w={`${100 / tabs.length}%`}
                color="white"
                _selected={{ bg: "#E17875" }}
                _hover={{
                  ":not([aria-selected='true'])": { bg: "#3B2C2F" },
                }}
                mb={2}
              >
                {tabName}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {components.map((Component, index) => (
              <TabPanel key={index} maxHeight="800px" overflowY="auto">{Component}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </ModalBody>
  );
};

const VoteHistory = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [voteHistory, setVoteHistory] = useState({});
  const showToast = useNotification();

  const fetchVoteHistory = useCallback(async () => {
    if (gameState.phase && gameState.phase.currentPhase !== "pre") {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const { data } = await axios.get(
          `/api/game/vote-history/${gameState.gameId}`,
          config,
        );

        setVoteHistory(data);
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.FETCH_VOTE_HISTORY_FAILED,
          "error",
        );
      }
    }
  }, [user.token, gameState, setVoteHistory, showToast]);

  useEffect(() => {
    fetchVoteHistory();
  }, [fetchVoteHistory, gameState?.phase]);

  return (
    <Box display="flex" flexDir="column">
      {Object.entries(voteHistory).length > 0 ? (
        Object.entries(voteHistory)
          .reverse()
          .map(([day, vote]) => (
            <Box key={day} mb={3}>
              <DisplayDay day={day} />
              <StyledDivider />
              <Box display="flex" flexDir="column">
                {Object.entries(vote).map(([votee, voters]) => {
                  const user = currentChannel.users.find((u) => u._id === votee);

                  return user ? (
                    <StyledBox>
                      <DisplayUser user={user}>
                        <Text>投票数：{voters.length}票</Text>
                        <Text>投票者：
                          {voters.map((voter) => {
                            const voteUser = currentChannel.users.find(
                              (u) => u._id === voter,
                            );

                            return voteUser ? `【${voteUser.name}】` : null;
                          }).join("、")}
                        </Text>
                      </DisplayUser>
                    </StyledBox>

                  ) : null;
                })}
              </Box>
            </Box>
          ))
      ) : (
        <StyledText>投票履歴がありません</StyledText>
      )}
    </Box>
  );
};

const FortuneResult = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [fortuneResult, setFortuneResult] = useState({});
  const showToast = useNotification();

  const teams = {
    unknown: "【不明】",
    villagers: "【村人】",
    werewolves: "【人狼】",
  };

  const fetchFortuneResult = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "seer"
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const { data } = await axios.get(
          `/api/game/fortune-result/${gameState.gameId}`,
          config,
        );
        setFortuneResult(data);
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.FETCH_FORTUNE_RESULT_FAILED,
          "error",
        );
      }
    }
  }, [user, gameState, setFortuneResult, showToast]);

  useEffect(() => {
    fetchFortuneResult();
  }, [fetchFortuneResult, gameState?.phase?.currentDay]);

  return (
    <Box display="flex" flexDir="column">
      {fortuneResult && Object.entries(fortuneResult).length > 0 ? (
        Object.entries(fortuneResult)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day} mb={3}>
                <DisplayDay day={day} />
                <StyledDivider />
                <StyledBox>
                  <DisplayUser user={player}>
                    <Text>占い結果：{teams[result.team]}</Text>
                  </DisplayUser>
                </StyledBox>
                </Box>
            ) : null;
          })
      ) : (
        <StyledText>占い結果がありません</StyledText>
      )}
    </Box>
  );
};

const MediumResult = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [mediumResult, setMediumResult] = useState({});
  const showToast = useNotification();

  const teams = {
    unknown: "【不明】",
    villagers: "【村人】",
    werewolves: "【人狼】",
  };

  const fetchMediumResult = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "medium"
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const { data } = await axios.get(
          `/api/game/medium-result/${gameState.gameId}`,
          config,
        );
        setMediumResult(data);
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.FETCH_MEDIUM_RESULT_FAILED,
          "error",
        );
      }
    }
  }, [user, gameState, setMediumResult, showToast]);

  useEffect(() => {
    fetchMediumResult();
  }, [fetchMediumResult, gameState?.phase?.currentDay]);

  return (
    <Box display="flex" flexDir="column">
      {mediumResult && Object.entries(mediumResult).length > 0 ? (
        Object.entries(mediumResult)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day} mb={3}>
                <DisplayDay day={day} />
                <StyledDivider />
                <StyledBox>
                  <DisplayUser user={player}>
                    <Text>霊能結果：{teams[result.team]}</Text>
                  </DisplayUser>
                </StyledBox>

                </Box>
            ) : null;
          })
      ) : (
        <StyledText>霊能結果がありません</StyledText>
      )}
    </Box>
  );
};

const GuardHistory = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [guardHistory, setGuardHistory] = useState({});
  const showToast = useNotification();

  const fetchGuardHistory = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "hunter"
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const { data } = await axios.get(
          `/api/game/guard-history/${gameState.gameId}`,
          config,
        );
        setGuardHistory(data);
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.FETCH_GUARD_HISTORY_FAILED,
          "error",
        );
      }
    }
  }, [user, gameState, setGuardHistory, showToast]);

  useEffect(() => {
    fetchGuardHistory();
  }, [fetchGuardHistory, gameState?.phase?.currentDay]);

  return (
    <Box display="flex" flexDir="column">
      {guardHistory && Object.entries(guardHistory).length > 0 ? (
        Object.entries(guardHistory)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day} mb={3}>
                <DisplayDay day={day} />
                <StyledDivider />
                <StyledBox>
                  <DisplayUser user={player} />
                </StyledBox>
              </Box>
            ) : null;
          })
      ) : (
        <StyledText>護衛履歴がありません</StyledText>
      )}
    </Box>
  );
};

const AttackHistory = () => {
  const { user, currentChannel, gameState } = useUserState();
  const [attackHistory, setAttackHistory] = useState({});
  const showToast = useNotification();

  const fetchAttackHistory = useCallback(async () => {
    if (
      gameState?.phase && gameState.phase.currentPhase !== "pre" &&
      user.role === "werewolf"
    ) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const { data } = await axios.get(
          `/api/game/attack-history/${gameState.gameId}`,
          config,
        );
        setAttackHistory(data);
      } catch (error) {
        showToast(
          error?.response?.data?.error || errors.FETCH_ATTACK_HISTORY_FAILED,
          "error",
        );
      }
    }
  }, [user, gameState, setAttackHistory, showToast]);

  useEffect(() => {
    fetchAttackHistory();
  }, [fetchAttackHistory, gameState?.phase?.currentDay]);

  return (
    <Box display="flex" flexDir="column">
      {attackHistory && Object.entries(attackHistory).length > 0 ? (
        Object.entries(attackHistory)
          .reverse()
          .map(([day, result]) => {
            const player = currentChannel.users.find(
              (u) => u._id === result.playerId,
            );
            return player ? (
              <Box key={day} mb={3}>
                <DisplayDay day={day} />
                <StyledDivider />
                <StyledBox>
                  <DisplayUser user={player} />
                </StyledBox>
              </Box>
            ) : null;
          })
      ) : (
        <StyledText>襲撃履歴がありません</StyledText>
      )}
    </Box>
  );
};

export default VoteHistoryTabs;
