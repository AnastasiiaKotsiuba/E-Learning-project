import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Student/Home";
import Teacher from "./pages/Student/Teachers";
import Courses from "./pages/Student/Courses";
import Dashboards from "./pages/Student/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teachers" element={<Teacher />} /> {/* Виправлено */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/dashboards" element={<Dashboards />} />
      </Routes>
    </Router>
  );
};

export default App;
