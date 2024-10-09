import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Channels from "./pages/Channels";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chats" element={<Channels />} />
      </Routes>
    </div>
  );
}

export default App;
