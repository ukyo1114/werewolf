import { unionBy, reject, union, without } from "lodash";

const initialChannelState = {
  _id: "",
  channelName: "",
  description: "",
  users: [],
  channelAdmin: "",
  blockUsers: [],
  channel: "",
  isGame: false,
  phase: {
    currentDay: 0,
    currentPhase: "",
    changedAt: null,
  },
};

function channelReducer(state = initialChannelState, action) {
  switch (action.type) {
    case "JOIN_CHANNEL":
      return { ...initialChannelState, ...action.payload };
    case "JOIN_GAME":
      return { ...state, ...action.payload, isGame: true };
    case "LEAVE_CHANNEL":
      return initialChannelState;
    case "USER_JOINED":{
      const users = unionBy([action.payload], state.users, "_id");
      return { ...state, users };
    }
    case "USER_LEFT": {
      const users = reject(state.users, { _id: action.payload });
      return { ...state, users };
    }
    case "USER_BLOCKED": {
      const users = reject(state.users, { _id: action.payload });
      const blockUsers = union(state.blockUsers, [action.payload]);
      return { ...state, users, blockUsers };
    }
    case "CANCEL_BLOCK": {
      const blockUsers = without(state.blockUsers, action.payload);
      return { ...state, blockUsers };
    }
    case "CHANNEL_SETTINGS": {
      const { channelName, description } = action.payload;
      return { ...state, channelName, description };
    }
    case "UPDATE_GAME_STATE": {
      const users = state.users.map((user) => {
        const updatedUser = action.payload.users.find((u) => u._id === user._id);
        return updatedUser ? { ...user, ...updatedUser } : user;
      });
      const phase = action.payload.phase;
      return { ...state, users, phase };
    }
    default:
      return state;
  }
}

export { channelReducer, initialChannelState };