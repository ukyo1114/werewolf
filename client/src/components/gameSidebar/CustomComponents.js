import { Box, Text, Button } from "@chakra-ui/react";

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

export const StyledText = ({ children }) => (
  <Text fontSize="lg" display={{ base: "none", lg: "flex" }} ml={3}>
    {children}
  </Text>
);

export const CustomButton = ({ children, ...props }) => (
  <Button
    variant="ghost"
    my={2}
    {...props}
  >
    {children}
  </Button>
);