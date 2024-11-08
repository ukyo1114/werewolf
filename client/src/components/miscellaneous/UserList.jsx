import React from "react";
import { Box, Text, ModalBody } from "@chakra-ui/react";
import "../styles.css";
import DisplayUser from "./DisplayUser.jsx";
import { StyledBox, StyledText } from "./CustomComponents.jsx";
import { USER_STATUS } from "../../constants";
import { useUserState } from "../../context/UserProvider.jsx";

const UserList = ({ userList }) => {
  const { currentChannel } = useUserState();
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
          userList.map((user) => {
            if (isGame && !user.status) return null;
            
            return (
              <StyledBox key={user._id}>
                <DisplayUser user={user}>
                  {user.status && 
                    <Text>{USER_STATUS[user.status]}</Text>
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
