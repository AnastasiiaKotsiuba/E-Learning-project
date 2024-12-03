import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Courses from "./pages/Student/Courses";
import TeachersPage from "./pages/Student/Teachers";
import Dashboard from "./pages/Student/Dashboard";
import AuthPage from "./pages/Auth/AuthPage";
import Home from "./pages/Teacher/Home";

const App = () => {
  const [user, setUser] = useState(null); // Стан для збереження даних користувача

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <Router>
      <Routes>
        {!user ? (
          <Route path="*" element={<AuthPage onLogin={handleLogin} />} />
        ) : user.role === "student" ? (
          <>
            <Route path="/courses" element={<Courses />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/courses" />} />
          </>
        ) : (
          <>
            {/* Маршрути для вчителя */}
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
