import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
} from "@chakra-ui/react";
import Login from "./Login";
import Signup from "./Signup";

const Auth = () => {
  const boxBg = useColorModeValue("gray.700", "gray.800");
  const boxBorderColor = useColorModeValue("gray.600", "gray.700");
  const tabBg = useColorModeValue("gray.600", "gray.700");
  const tabSelectedBg = useColorModeValue("teal.500", "teal.600");
  const tabSelectedColor = useColorModeValue("white", "white");

  return (
    <Box
      bg={boxBg}
      w="100%"
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={boxBorderColor}
    >
      <Tabs variant="enclosed" colorScheme="teal">
        <TabList bg={tabBg} borderRadius="md">
        <Tab
          w="50%"
          _selected={{
            bg: tabSelectedBg,
            color: tabSelectedColor,
          }}
          _hover={{ bg: "gray.500" }}
        >
          ログイン
        </Tab>
        <Tab
          w="50%"
          _selected={{
            bg: tabSelectedBg,
            color: tabSelectedColor,
          }}
          _hover={{ bg: "gray.500" }}
        >
          ユーザー登録
        </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Login />
          </TabPanel>
          <TabPanel>
            <Signup />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Auth;
