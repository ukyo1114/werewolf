import { createContext, useReducer, useEffect, useContext } from "react";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import { userReducer, initialUserState } from "../reducers/userReducer";
import { channelReducer, initialChannelState } from "../reducers/channelReducer";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, uDispatch] = useReducer(userReducer, initialUserState);
  const [currentChannel, cDispatch] = useReducer(
    channelReducer, initialChannelState
  );
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const navigate = useNavigate();

  useEffect(() => {
    const resend = localStorage.getItem("resend")
    if (resend) return;

    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) navigate("/home");
    
    const userIn = JSON.parse(userInfo);
    uDispatch({ type: "LOGIN", payload: userIn });
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{ user, uDispatch, currentChannel, cDispatch, isMobile }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserState = () => {
  return useContext(UserContext);
};

export default UserProvider;
