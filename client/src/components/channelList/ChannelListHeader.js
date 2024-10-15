import React from "react";
import {
  Box,
  Checkbox,
} from "@chakra-ui/react";

const ChannelListHeader = ({ showJoinedCh, setShowJoinedCh }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      w="100%"
      px={4}
      py={3}
      fontSize="lg"
    >
      <strong>チャンネルリスト</strong>
      <Checkbox
        id="isJoined"
        isChecked={showJoinedCh}
        onChange={(e) => setShowJoinedCh(e.target.checked)}
      >
        参加中のみ
      </Checkbox>
    </Box>
  );
};

export default ChannelListHeader;