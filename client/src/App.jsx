import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import Home from "./pages/Home.jsx";

const Channels = lazy(() => import("./pages/Channels.jsx"));
const EmailVerification = lazy(() => import("./pages/EmailVerification.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Channels />} />
          <Route path="/verification/:token" element={<EmailVerification />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
