import React from "react";
import { useUserState } from "../../context/userProvider";
import {
  Box,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import EntryCounter from "../miscellaneous/EntryCounter";
import GameTimer from "../miscellaneous/GameTimer";
import ProfileModal from "../profile/ProfileModal";
import ProfileSettingsModal from "../profile/ProfileSettingsModal";
import UserSettingsModal from "../profile/UserSettingsModal";

const ChannelHeader = () => {
  const pModal = useDisclosure();
  const psModal = useDisclosure();
  const usModal = useDisclosure();

  const navigate = useNavigate();
  const { user, setUser, currentChannel, gameState } = useUserState();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      bg="white"
      w="100%"
      p="5px 10px 5px 10px"
    >
      <Text fontSize="2xl">
        10人で人狼
      </Text>
      {currentChannel && (gameState ? <GameTimer /> : <EntryCounter />)}
      <Menu>
        <MenuButton>
          <Avatar
            size="sm"
            cursor="pointer"
            name={user.name}
            src={user.pic}
            borderRadius="md"
          />
        </MenuButton>
        <MenuList>
            <MenuItem onClick={pModal.onOpen}>プロフィール</MenuItem>
            <ProfileModal
              isOpen={pModal.isOpen}
              onClose={pModal.onClose}
            />
          <MenuDivider />
          <MenuItem onClick={psModal.onOpen}>プロフィール設定</MenuItem>
          <ProfileSettingsModal
            isOpen={psModal.isOpen}
            onClose={psModal.onClose}
          />
          <MenuDivider />
          <MenuItem onClick={usModal.onOpen}>Eメール・パスワード設定</MenuItem>
          <UserSettingsModal
            isOpen={usModal.isOpen}
            onClose={usModal.onClose}
          />
          <MenuDivider />
          <MenuItem onClick={logoutHandler}>ログアウト</MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default ChannelHeader;