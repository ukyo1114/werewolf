import { Suspense, lazy } from "react";
import {
  Tabs, TabList, Tab, TabPanels, TabPanel
} from "@chakra-ui/react";

import Login from "./Login.jsx";
const Signup = lazy(() => import("./Signup.jsx"));

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
          <Suspense fallback={<div>Loading...</div>}>
            <Signup />
          </Suspense>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Auth;
