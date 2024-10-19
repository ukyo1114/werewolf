import React from "react";
import { Box,  ModalBody, Text } from "@chakra-ui/react";
import "../styles.css";
import DisplayUser from "./DisplayUser";

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
      >
        {userList.length > 0 ? (
          userList.map((user) => (
            <Box 
              key={user._id}
              display="flex"
              alignItems="center"
              p={3}
              mb={3}
              borderRadius="lg"
              bg="#3B2C2F"
            >
              <DisplayUser user={user} />
            </Box>
          ))
        ) : (
          <Text
            fontSize="lg"
            bg="#3B2C2F"
            borderRadius="lg"
            p={3}
            textAlign="center" 
          >ユーザーがいません</Text>
        )}
      </Box>
    </ModalBody>
  );
};

export default UserList;
