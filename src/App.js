import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "../../tryapp/src/components/Header";
import Courses from "../../tryapp/src/pages/Student/Courses";
import TeachersPage from "../../tryapp/src/pages/Student/Teachers";
import Dashboard from "../../tryapp/src/pages/Student/Dashboard";
import AuthPage from "../../tryapp/src/pages/Auth/AuthPage";
import Home from "../../tryapp/src/pages/Teacher/Home";

// === 1. ГЛОБАЛЬНІ ДАНІ (ПІДНЯТІ НА НАЙВИЩИЙ РІВЕНЬ) ===

// Повний список курсів
const allVideosData = [
  {
    id: 1,
    title: "How to learn JavaScript for 5 days for totally beginners",
    teacher: "Alison Perry",
  },
  { id: 2, title: "Learn React", teacher: "John Doe" },
  { id: 3, title: "Advanced JavaScript", teacher: "Jane Smith" },
  { id: 4, title: "CSS Animations", teacher: "Emily Davis" },
  { id: 5, title: "Responsive Design", teacher: "Michael Brown" },
  { id: 6, title: "Node.js Basics", teacher: "Sarah Johnson" },
  { id: 7, title: "Python for Beginners", teacher: "Laura Wilson" },
  {
    id: 8,
    title: "CSS Animations for Advance level: How to create cards",
    teacher: "Emily Davis",
  },
];

// Повний список викладачів
const allTeachersData = [
  {
    id: 1,
    name: "Adrian Spring",
    description:
      "I'm Adrian Spring, your teacher for this year. I'm excited to embark on this journey of learning and discovery.",
    filters: ["English", "Polish", "Spanish"],
  },
  {
    id: 2,
    name: "Emily Davis",
    description:
      "I'm Emily Davis, an experienced teacher passionate about sharing knowledge. Let’s explore the new!",
    filters: ["English", "French"],
  },
  {
    id: 3,
    name: "Michael Brown",
    description:
      "Michael here! I specialize in making complex topics simple and enjoyable for all learners.",
    filters: ["English", "German"],
  },
];

// === 2. КОМПОНЕНТ ДЛЯ ОБГОРТАННЯ МАРШРУТІВ СТУДЕНТА ===
// Цей компонент рендерить Header та передає пропси пошуку дочірнім елементам
const StudentLayout = ({
  searchTerm,
  onSearchChange,
  allVideosData,
  allTeachersData,
}) => (
  <>
    <Header searchTerm={searchTerm} onSearchChange={onSearchChange} />
    <Routes>
      <Route
        path="/courses"
        element={
          <Courses recommendedVideos={allVideosData} searchTerm={searchTerm} />
        }
      />
      <Route
        path="/teachers"
        element={
          <TeachersPage allTeachers={allTeachersData} searchTerm={searchTerm} />
        }
      />
      {/* Dashboard не потребує searchTerm, але потребує оновлених даних */}
      <Route
        path="/dashboard"
        element={
          <Dashboard
            allTeachers={allTeachersData}
            recommendedVideos={allVideosData}
          />
        }
      />
      <Route path="*" element={<Navigate to="/courses" />} />
    </Routes>
  </>
);

// === 3. ГОЛОВНИЙ КОМПОНЕНТ APP ===
const App = () => {
  // Стан для автентифікації
  const [user, setUser] = useState(null);
  // Стан для глобального пошуку
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogin = (userData) => {
    setUser({ role: "student", name: "Anastasiia" }); 
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const searchProps = {
    searchTerm,
    onSearchChange: handleSearchChange,
    allVideosData,
    allTeachersData,
  };

  return (
    <Router>
      <Routes>
        {/* АВТЕНТИФІКАЦІЯ: Не авторизований */}
        {!user ? (
          <Route path="/*" element={<AuthPage onLogin={handleLogin} />} />
        ) : user.role === "student" ? (
          <Route path="/*" element={<StudentLayout {...searchProps} />} />
        ) : (
          // ВЧИТЕЛЬ: Маршрути для вчителя
          <Route path="/*" element={<Home />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
