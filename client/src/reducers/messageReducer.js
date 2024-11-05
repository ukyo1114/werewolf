import _ from "lodash";

function messagesReducer(state, action) {
  switch (action.type) {
    case "FETCH_MESSAGES": 
      return action.payload;
    case "RECEIVE_MESSAGE": {
      const updatedMessages = _.uniqBy(
        [action.payload, ...state], "_id",
      );
      return updatedMessages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    default:
      return state;
  }
}

export default messagesReducer;