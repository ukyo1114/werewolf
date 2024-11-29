import {
  Flex, Text, Divider, Button, Tooltip,
} from "@chakra-ui/react";
import { useUserState } from "../../context/UserProvider";

export const DisplayDay = ({ day }) => (
  <Text textAlign="center" fontWeight="bold" fontSize="lg" mb={1}>
    {day}日目
  </Text>
);

export const StyledDivider = () => (
  <Divider borderWidth={1} borderColor="gray.700" my={2} />
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

export const SidebarButton = ({ label, children, ...props }) => {
  const { isMobile } = useUserState();

  return (
    <Tooltip label={label} placement="bottom-end">
      <Button variant="ghost" my={2} {...props}>
        {children}
        <Text
          color="gray.700"
          display={isMobile ? "flex" : { base: "none", lg: "flex" }}
          ml={3}
        >
          {label}
        </Text>
      </Button>
    </Tooltip>
  );
};

export const SelectableBox = ({ children, ...props }) => (
  <Flex
    alignItems="center"
    p={4}
    borderRadius="lg"
    cursor="pointer"
    boxShadow="uniform"
    {...props}
  >
    {children}
  </Flex>
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

export const iconProps = {
  size: "30px",
  color: "#4A5568"
};