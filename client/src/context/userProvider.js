import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [gameState, setGameState] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) navigate("/");

    try {
      const userIn = JSON.parse(userInfo);
      setUser(userIn);
    } catch (error) {
      console.error("Error parsing userInfo from localStorage:", error);
      navigate("/");
    }
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        currentChannel,
        setCurrentChannel,
        gameState,
        setGameState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserState = () => {
  return useContext(UserContext);
};

export default UserProvider;
