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
      <Box w="100%">
        <Auth />
      </Box>
    </Container>
  );
};

export default Home;
