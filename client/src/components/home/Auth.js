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
  return (
    <Box w="100%">
      <Tabs variant="enclosed" colorScheme="teal">
        <TabList bg="#3B2C2F" borderTopRadius="lg">
        <Tab
          w="50%"
          _selected={{ bg: "#E17875" }}
          _hover={{
            ":not([aria-selected='true'])": { bg: "#907D81" },
          }}
        >
          ログイン
        </Tab>
        <Tab
          w="50%"
          _selected={{ bg: "#E17875" }}
          _hover={{
            ":not([aria-selected='true'])": { bg: "#907D81" },
          }}
        >
          ユーザー登録
        </Tab>
        </TabList>
        <TabPanels>
          <TabPanel
            borderBottomRadius="lg"
            borderWidth={2}
            borderColor="#E17875"
          >
            <Login />
          </TabPanel>
          <TabPanel
            borderBottomRadius="lg"
            borderWidth={2}
            borderColor="#E17875"
          >
            <Signup />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Auth;
