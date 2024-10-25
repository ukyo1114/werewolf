import { Box, Text, Divider, Button, Tooltip } from "@chakra-ui/react";

export const DisplayDay = ({ day }) => (
  <Text textAlign="center" fontWeight="bold" fontSize="lg" mb={1}>
    {day}日目
  </Text>
);

export const StyledDivider = () => (
  <Divider borderWidth={1} borderColor="#E17875" my={2} />
)

export const StyledBox = ({ children, ...props }) => (
  <Box
    display="flex"
    alignItems="center"
    mb={3}
    p={3}
    borderRadius="lg"
    bg="#3B2C2F"
    {...props}
  >
    {children}
  </Box>
);

export const StyledText = ({ children, ...props }) => (
  <Text
    fontSize="lg"
    textAlign="center"
    bg="#3B2C2F"
    borderRadius="lg"
    p={3}
    {...props}
  >
    {children}
  </Text>
);

export const TimerAndRole = ({ children, status }) => (
  <Text
    fontSize="md"
    fontWeight="bold"
    textAlign="center"
    bg={status === "alive" ? "teal" : "#3B2C2F" }
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
    fontWeight="bold"
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
    justifyContent="space-between"
    alignItems="center"
    w="100%"
    px={4}
    py={3}
    {...props}
  >
    {children}
  </Box>
);

export const SidebarBox = ({ children}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems={{ base: 'center', lg: 'flex-start' }}
    width="100%"
  >
    {children}
  </Box>
);

export const SidebarButton = ({ label, children, ...props }) => (
  <Tooltip label={label} placement="bottom-end">
    <Button
      variant="ghost"
      my={2}
      {...props}
    >
      {children}
      <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
        {label}
      </Text>
    </Button>
  </Tooltip>
);

export const iconProps = {
  size: "30px",
  color: "#E17875"
};