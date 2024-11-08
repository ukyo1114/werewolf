import React, { useEffect } from "react";
import { Container } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import Auth from "../components/home/Auth.jsx";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return;
    
    try {
      const user = JSON.parse(userInfo);
      if (!user) return;
      navigate("/chats");
    } catch (error) {
      console.error("Error parsing userInfo from localStorage:", error);
    }
  }, [navigate]);

  return (
    <Container maxW="xl" mt={7} centerContent className="homePage">
      <Auth />
    </Container>
  );
};

export default Home;
