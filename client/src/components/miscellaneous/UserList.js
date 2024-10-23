import React from "react";
import { Box, ModalBody } from "@chakra-ui/react";
import "../styles.css";
import DisplayUser from "./DisplayUser";
import { StyledBox, StyledText } from "./CustomComponents";

const UserList = ({ children, userList }) => {
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
                {children}
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
