import "./Tailwind.css";
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Drawer from "./components/Drawer3.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Drawer />} />
    </Routes>
  );
}

export default App;
