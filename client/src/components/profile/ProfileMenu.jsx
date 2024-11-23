import React from "react";
import { useUserState } from "../../context/UserProvider.jsx";
import {
  Menu,
  MenuButton,
  Box,
  Center,
  Avatar,
  Text,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import ProfileSettingsModal from "./ProfileSettingsModal";
import UserSettingsModal from "./UserSettingsModal";
import ModalTemplete from "../miscellaneous/ModalTemplete";
import { EllipsisText } from "../miscellaneous/CustomComponents.jsx";

const ProfileMenu = () => {
  const pModal = useDisclosure();
  const psModal = useDisclosure();
  const usModal = useDisclosure();

  const navigate = useNavigate();
  const { user, uDispatch, isMobile } = useUserState();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    uDispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <Menu>
      <MenuButton
        borderRadius="lg"
        boxShadow="uniform"
        _hover={{ bg: "gray.200" }}
        overflow="hidden"
      >
        <Center px={2} py={1}>
          <Avatar size="md" name={user.name} src={user.pic} borderRadius="md" />
          <Box
            display={isMobile ? "flex" : { base: "none", lg: "flex" }}
            alignItems="center"
            justifyContent="space-between"
            ml={1}
            minW="0"
          >
            <EllipsisText pr={1} fontSize="sm">{user.name}</EllipsisText>
            <Box color="gray.700"><FaEllipsisH /></Box>
          </Box>
        </Center>
      </MenuButton>
      <MenuList boxShadow="uniform">
        <MenuItem
          _hover={{ bg: "gray.200" }}
          onClick={pModal.onOpen}
        >
          プロフィール
        </MenuItem>

        <ModalTemplete
          isOpen={pModal.isOpen}
          onClose={pModal.onClose}
          title={"プロフィール"}
        >
          <ProfileModal />
        </ModalTemplete>

        <MenuDivider borderColor="gray.700" />

        <MenuItem
          _hover={{ bg: "gray.200" }}
          onClick={psModal.onOpen}
        >
          プロフィール設定
        </MenuItem>

        <ModalTemplete
          isOpen={psModal.isOpen}
          onClose={psModal.onClose}
          title={"プロフィール設定"}
        >
          <ProfileSettingsModal onClose={psModal.onClose} />
        </ModalTemplete>

        <MenuDivider borderColor="gray.700" />

        <MenuItem
          _hover={{ bg: "gray.200" }}
          onClick={usModal.onOpen}
        >
          Eメール・パスワード設定
        </MenuItem>

        <ModalTemplete
          isOpen={usModal.isOpen}
          onClose={usModal.onClose}
          title={"Eメール・パスワード設定"}
        >
          <UserSettingsModal />
        </ModalTemplete>

        <MenuDivider borderColor="gray.700" />

        <MenuItem
          _hover={{ bg: "gray.200" }}
          onClick={logoutHandler}
        >
          ログアウト
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenu;