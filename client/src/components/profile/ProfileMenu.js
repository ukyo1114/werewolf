import React from "react";
import { useUserState } from "../../context/userProvider";
import {
  Menu,
  MenuButton,
  Box,
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

const ProfileMenu = () => {
  const pModal = useDisclosure();
  const psModal = useDisclosure();
  const usModal = useDisclosure();

  const navigate = useNavigate();
  const { user, setUser } = useUserState();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/");
  };

  return (
    <Menu>
      <MenuButton
        mb={3}
        px={4}
        py={2}
        borderRadius="md"
        _hover={{ bg: "#3B2C2F" }}
      >
        <Box display="flex" alignItems="center">
          <Avatar
            size="md"
            cursor="pointer"
            name={user.name}
            src={user.pic}
            borderRadius="md"
          />
          <Box
            display={{ base: "none", lg: "flex" }}
            alignItems="center"
            justifyContent="space-between"
            ml={3}
          >
            <Text ><strong>{user.name}</strong></Text>
            <FaEllipsisH color="#E17875" />
          </Box>
        </Box>
      </MenuButton>
      <MenuList
        bg="#2B2024"
        borderWidth={2}
        borderColor="#E17875"
        boxShadow="0px 0px 15px 5px rgba(255, 255, 255, 0.1)"
      >
        <MenuItem
          bg="#2B2024"
          _hover={{ bg: "#3B2C2F" }}
          onClick={pModal.onOpen}
        >
          プロフィール
        </MenuItem>
        <ModalTemplete
          isOpen={pModal.isOpen}
          onClose={pModal.onClose}
          title={"プロフィール"}
          Contents={ProfileModal}
        />
        <MenuDivider borderColor="#E17875" />
        <MenuItem
          bg="#2B2024"
          _hover={{ bg: "#3B2C2F" }}
          onClick={psModal.onOpen}
        >
          プロフィール設定
        </MenuItem>
        <ModalTemplete
          isOpen={psModal.isOpen}
          onClose={psModal.onClose}
          title={"プロフィール設定"}
          Contents={ProfileSettingsModal}
        />
        <MenuDivider borderColor="#E17875" />
        <MenuItem
          bg="#2B2024"
          _hover={{ bg: "#3B2C2F" }}
          onClick={usModal.onOpen}
        >
          Eメール・パスワード設定
        </MenuItem>
        <ModalTemplete
          isOpen={usModal.isOpen}
          onClose={usModal.onClose}
          title={"Eメール・パスワード設定"}
          Contents={UserSettingsModal}
        />
        <MenuDivider borderColor="#E17875" />
        <MenuItem
          bg="#2B2024"
          _hover={{ bg: "#3B2C2F" }}
          onClick={logoutHandler}
        >
          ログアウト
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileMenu;