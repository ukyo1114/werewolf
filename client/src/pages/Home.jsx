import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Box, Image } from "@chakra-ui/react";
import Auth from "../components/home/Auth.jsx";
import { useUserState } from "../context/UserProvider.jsx";

const Home = () => {
  const { uDispatch, chDispatch } = useUserState();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userInfo")) {
      navigate("/chats");
    } else {
      uDispatch({ type: "LOGOUT" });
      chDispatch({ type: "LEAVE_CHANNEL" });
    }
  }, [navigate, uDispatch, chDispatch]);

  return (
    <Container
      gap={8}
      display="flex"
      centerContent
      maxW="xl"
    >
      <Image mt={8} w="300px" h="63px" src="/TITLE.webp" alt="10人で人狼" />
      <Box w="100%">
        <Auth />
      </Box>
    </Container>
  );
};

export default Home;