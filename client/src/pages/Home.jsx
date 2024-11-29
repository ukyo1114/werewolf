import { Suspense, lazy, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Box, Image } from "@chakra-ui/react";

const Auth = lazy(() => import("../components/home/Auth.jsx"));

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("userInfo")) navigate("/chats");
  }, [navigate]);

  return (
    <Container
      gap={8}
      display="flex"
      centerContent
      maxW="xl"
    >
      <Image mt={8} w="300px" h="63px" src="/TITLE.webp" alt="10人で人狼" />
      <Box w="100%">
        <Suspense fallback={<div>Loading...</div>}>
          <Auth />
        </Suspense>
      </Box>
    </Container>
  );
};

export default Home;