import { Box, Text, Divider } from "@chakra-ui/react";

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