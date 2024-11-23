import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Channels from "./pages/Channels.jsx";
import { EmailVerification } from "./pages/EmailVerification.jsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/chats" element={<Channels />} />
        <Route path="/verification" element={<EmailVerification />} />
      </Routes>
    </div>
  );
}

export default App;
