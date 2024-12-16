const initialUserState = {
  _id: "",
  name: "",
  pic: "",
  token: "",
  status: "",
  role: "",
  partnerId: "",
};

function userReducer(state = initialUserState, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, ...action.payload };
    case "JOIN_GAME":
      return { ...state, ...action.payload };
    case "LEAVE_GAME":
      return { ...state, status: "", role: "", partnerId: "" };
    case "LOGOUT":
      return initialUserState;
    case "CHANGE_NAME":
      return { ...state, name: action.payload };
    case "UPDATE_STATUS": {
      const user = action.payload.users[state._id];
      return user ? { ...state, status: user.status } : state;
    }
    default:
      return state;
  }
}

export { userReducer, initialUserState };