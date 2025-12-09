import "./Tailwind.css";
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Drawer from "./components/Drawer3.jsx";

function App() {
  return (
    <Drawer />
    // <Routes>
    //   <Route path="/" element={<Drawer />} />
    //   {/* catch-all: send any unknown route back to home */}
    //   <Route path="*" element={<Navigate to="/" replace />} />
    // </Routes>
  );
}

export default App;
