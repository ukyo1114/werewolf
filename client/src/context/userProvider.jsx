import { createContext, useReducer, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { userReducer, initialUserState } from "../reducers/userReducer";
import { channelReducer, initialChannelState } from "../reducers/channelReducer";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, uDispatch] = useReducer(userReducer, initialUserState);
  const [currentChannel, cDispatch] =
    useReducer(channelReducer, initialChannelState);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) navigate("/");

    try {
      const userIn = JSON.parse(userInfo);
      uDispatch({ type: "LOGIN", payload: userIn });
    } catch (error) {
      console.error("Error parsing userInfo from localStorage:", error);
      navigate("/");
    }
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{ user, uDispatch, currentChannel, cDispatch }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserState = () => {
  return useContext(UserContext);
};

export default UserProvider;
