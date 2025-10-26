import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "../../tryapp/src/components/Header";
import TeacherHeader from "../../tryapp/src/components/TeacherHeader";

import Courses from "../../tryapp/src/pages/Student/Courses";
import TeachersPage from "../../tryapp/src/pages/Student/Teachers";
import Dashboard from "../../tryapp/src/pages/Student/Dashboard";
import AuthPage from "../../tryapp/src/pages/Auth/AuthPage";

import Home from "../../tryapp/src/pages/Teacher/Home";
import Chat from "../../tryapp/src/pages/Teacher/Chat"; // 👈 додай цей імпорт

import { auth, db } from "../../tryapp/src/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [videosData, setVideosData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const uid = currentUser.uid;
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setUser({
          uid,
          role: userData.role || "student",
          name: userData.username || "User",
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const videoUnsub = onSnapshot(
      collection(db, "videos"),
      (snapshot) => {
        const videos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideosData(videos);
        setIsLoading(false);
      },
      (error) => console.error("Error loading videos:", error)
    );

    const teacherUnsub = onSnapshot(
      collection(db, "teachers"),
      (snapshot) => {
        const teachers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachersData(teachers);
        setIsLoading(false);
      },
      (error) => console.error("Error loading teachers:", error)
    );

    return () => {
      videoUnsub();
      teacherUnsub();
    };
  }, []);

  const handleLogin = (userData) => {
    setUser({
      ...userData,
      uid: auth.currentUser ? auth.currentUser.uid : Date.now().toString(),
    });
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  if (!isAuthReady) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      {user && user.role === "student" && (
        <Header
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onLogout={handleLogout}
        />
      )}

      {user && user.role === "teacher" && (
        <TeacherHeader onLogout={handleLogout} />
      )}

      <Routes>
        <Route
          path="/auth"
          element={
            !user ? (
              <AuthPage onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {user && user.role === "student" && (
          <>
            <Route
              path="/courses"
              element={
                <Courses
                  recommendedVideos={videosData}
                  searchTerm={searchTerm}
                  userName={user.name}
                />
              }
            />
            <Route
              path="/teachers"
              element={
                <TeachersPage
                  allTeachers={teachersData}
                  searchTerm={searchTerm}
                  userName={user.name}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  recommendedVideos={videosData}
                  allTeachers={teachersData}
                  userName={user.name}
                />
              }
            />
            <Route path="*" element={<Navigate to="/courses" replace />} />
          </>
        )}

        {user && user.role === "teacher" && (
          <>
            <Route path="/teacher/home" element={<Home />} />
            <Route path="/teacher/chat" element={<Chat />} />
            <Route path="*" element={<Navigate to="/teacher/home" replace />} />
          </>
        )}

        {!user && <Route path="/*" element={<Navigate to="/auth" replace />} />}
      </Routes>
    </Router>
  );
};

export default App;
