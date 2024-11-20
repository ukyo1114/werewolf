import {
  Tabs, TabList, Tab, TabPanels, TabPanel
} from "@chakra-ui/react";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";

const Auth = () => {
  return (
    <Tabs>
      <TabList>
        <Tab w="50%">ログイン</Tab>
        <Tab w="50%">ユーザー登録</Tab>
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
  );
};

export default Auth;
