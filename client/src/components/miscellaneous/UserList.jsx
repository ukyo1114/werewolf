import React from "react";
import { Box, Text, ModalBody } from "@chakra-ui/react";
import DisplayUser from "./DisplayUser.jsx";
import { StyledBox, StyledText } from "./CustomComponents.jsx";
import { USER_STATUS } from "../../constants";
import { useUserState } from "../../context/UserProvider.jsx";

const UserList = ({ userList }) => {
  const { user, currentChannel } = useUserState();
  const { isGame } = currentChannel;
  return (
    <ModalBody>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        w="100%"
        h="100%"
        borderRadius="lg"
        mb={4}
        maxHeight="800px"
        overflowY="auto"
      >
        {userList.length > 0 ? (
          userList.map((u) => {
            if (isGame && !u.status) return null;
            
            return (
              <StyledBox key={u._id}>
                <DisplayUser user={u}>
                {u.status &&
                  <Text>
                    {USER_STATUS[u.status]}
                    {u._id === user.partnerId && ` 【${USER_STATUS.partner}】`}
                  </Text>
                }
                </DisplayUser>
              </StyledBox>
            )
          })
        ) : (
          <StyledText>ユーザーがいません</StyledText>
        )}
      </Box>
    </ModalBody>
  );
};

export default UserList;
