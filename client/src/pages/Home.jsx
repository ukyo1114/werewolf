import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Container, Box, Image } from "@chakra-ui/react";

import Auth from "../components/home/Auth.jsx";

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
      <Image mt={8} src="/TITLE.png" alt="10人で人狼" maxW="50%" />
      <Box w="100%">
        <Auth />
      </Box>
    </Container>
  );
};

export default Home;
