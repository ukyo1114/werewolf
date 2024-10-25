import React from "react";
import { Text, Checkbox } from "@chakra-ui/react";
import { ChannelHeader } from "../miscellaneous/CustomComponents";

const ChannelListHeader = ({ showJoinedCh, setShowJoinedCh }) => {
  return (
    <ChannelHeader>
      <Text fontSize="lg"><strong>チャンネルリスト</strong></Text>

      <Checkbox
        id="isJoined"
        isChecked={showJoinedCh}
        onChange={(e) => setShowJoinedCh(e.target.checked)}
      >
        参加中のみ
      </Checkbox>
    </ChannelHeader>
  );
};

export default ChannelListHeader;