import React from "react";
import { Box, Text, ModalBody } from "@chakra-ui/react";
import "../styles.css";
import DisplayUser from "./DisplayUser";
import { StyledBox, StyledText } from "./CustomComponents";
import { USER_STATUS } from "../../constants";

const UserList = ({ userList }) => {
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
          userList.map((user) => (
            <StyledBox key={user._id}>
              <DisplayUser user={user}>
                {user.status && 
                  <Text>{USER_STATUS[user.status]}</Text>
                }
              </DisplayUser>
            </StyledBox>
          ))
        ) : (
          <StyledText>ユーザーがいません</StyledText>
        )}
      </Box>
    </ModalBody>
  );
};

export default UserList;
