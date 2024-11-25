import React from "react";
import { Stack, Text, ModalBody } from "@chakra-ui/react";
import DisplayUser from "./DisplayUser.jsx";
import { StyledText } from "./CustomComponents.jsx";
import { USER_STATUS } from "../../constants";
import { useUserState } from "../../context/UserProvider.jsx";

const UserList = ({ userList }) => {
  const { user, currentChannel } = useUserState();
  const { isGame } = currentChannel;
  return (
    <ModalBody>
      <Stack
        gap={4}
        p={4}
        maxH="60vh"
        overflowY="auto"
      >
        {userList.length > 0 ? (
          userList.map((u) => {
            if (isGame && !u.status) return null;
            
            return (
              <DisplayUser key={u._id} user={u}
                bg={u.status && (
                  u.status === "dead" ? "purple.100" :
                  u._id === user.partnerId ? "pink.100" : "green.100"
                )}
              >
              {u.status &&
                <Text>
                  {USER_STATUS[u.status]}
                  {u._id === user.partnerId && ` 【${USER_STATUS.partner}】`}
                </Text>
              }
              </DisplayUser>
            )
          })
        ) : (
          <StyledText>ユーザーがいません</StyledText>
        )}
      </Stack>
    </ModalBody>
  );
};

export default UserList;
