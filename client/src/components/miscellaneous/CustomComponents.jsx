import {
  Box, Text, Divider, Button, Tooltip,
  Drawer, DrawerOverlay, DrawerContent,
} from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { useUserState } from "../../context/UserProvider";

export const DisplayDay = ({ day }) => (
  <Text textAlign="center" fontWeight="bold" fontSize="lg" mb={1}>
    {day}日目
  </Text>
);

export const StyledDivider = () => (
  <Divider borderWidth={1} borderColor="gray.700" my={2} />
)

export const StyledBox = ({ children, ...props }) => (
  <Box
    display="flex"
    alignItems="center"
    p={4}
    borderRadius="lg"
    boxShadow="uniform"
    {...props}
  >
    {children}
  </Box>
);

export const StyledText = ({ children, ...props }) => (
  <Text
    fontSize="lg"
    textAlign="center"
    borderRadius="lg"
    bg="gray.200"
    p={3}
    {...props}
  >
    {children}
  </Text>
);

export const DisplayRole = ({ children, status }) => (
  <Text
    fontSize="md"
    fontWeight="bold"
    textAlign="center"
    bg={status === "alive" ? "green.100" : "purple.100" }
    borderRadius="lg"
    px={3}
    py={1}
  >
    {children}
  </Text>
);

export const DisplayPhase = ({ children, ...props }) => (
  <Text
    fontSize="lg"
    display="flex"
    alignItems="center"
    {...props}
  >
    {children}
  </Text>
);

export const ChannelHeader = ({ children, ...props }) => (
  <Box
    display="flex"
    alignItems="center"
    w="100%"
    p={3}
    {...props}
  >
    {children}
  </Box>
);

export const HeaderContents = ({ children }) => (
  <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    w="100%"
  >
    {children}
  </Box>
)

export const SidebarBox = ({ children }) => {
  const { isMobile } = useUserState();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={isMobile ? "flex-start" : "center"}
      width="100%"
    >
      {children}
    </Box>
  );
};

export const SidebarButton = ({ label, children, ...props }) => {
  const { isMobile } = useUserState();

  return (
    <Tooltip label={label} placement="bottom-end">
      <Button variant="ghost" my={2} {...props}>
        {children}
        <Text
          color="gray.700"
          display={isMobile ? "flex" : "none"}
          ml={3}
        >
          {label}
        </Text>
      </Button>
    </Tooltip>
  );
};

export const ChannelBox = ({ children }) => (
  <Box
    display="flex"
    alignItems="center"
    flexDir="column"
    maxWidth="600px"
    width="100%"
    height="100vh"
  >
    {children}
  </Box>
);

export const SelectableBox = ({ children, ...props }) => (
  <Box
    display="flex"
    alignItems="center"
    p={4}
    borderRadius="lg"
    cursor="pointer"
    boxShadow="uniform"
    {...props}
  >
    {children}
  </Box>
);

export const EllipsisText = ({ children, ...props }) => (
  <Text
    whiteSpace="nowrap"
    overflow="hidden"
    textOverflow="ellipsis"
    {...props}
  >
    {children}
  </Text>
);

export const ModalButton = ({ children, disableCondition, ...props }) => {
  return (
    <Button
      mt={4}
      colorScheme="teal"
      width="100%"
      {...props}
    >
      {children}
    </Button>
  )
};

export const BarsButton = ({ ...props }) => (
  <Button size="sm" variant="ghost" {...props}>
    <Box color="gray.700"><FaBars /></Box>
  </Button>
);

export const SideMenu = ({ children, isOpen, onClose }) => (
  <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
    <DrawerOverlay />
    <DrawerContent>
      {children}
    </DrawerContent>
  </Drawer>
);

export const iconProps = {
  size: "30px",
  color: "#4A5568"
};