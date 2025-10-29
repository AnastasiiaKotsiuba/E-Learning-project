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
import Lessons from "../../tryapp/src/pages/Student/Lessons";
import TeachersPage from "../../tryapp/src/pages/Student/Teachers";
import Dashboard from "../../tryapp/src/pages/Student/Dashboard";
import AuthPage from "../../tryapp/src/pages/Auth/AuthPage";
import AddVideo from "./pages/Teacher/CreateContent";
import VideoPlayer from "../../tryapp/src/pages/Student/VideoPlayer";
import Home from "../../tryapp/src/pages/Teacher/Home";
import Chat from "../../tryapp/src/pages/Teacher/Chat";
import MyProfileT from "../../tryapp/src/pages/Teacher/MyProfileT";
import MyProfileS from "../../tryapp/src/pages/Student/MyProfileS";
import CourseBuilder from "../../tryapp/src/pages/Teacher/CourseBuilder"; // НОВИЙ ІМПОРТ

import { auth, db } from "../../tryapp/src/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [videosData, setVideosData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const uid = currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        let userData = userSnap.exists() ? userSnap.data() : {};

        if (userData.role === "teacher") {
          const teacherSnap = await getDoc(doc(db, "teachers", uid));
          if (teacherSnap.exists()) {
            const teacherData = teacherSnap.data();
            userData.photoURL = teacherData.photoURL || userData.photoURL;
            userData.username = teacherData.username || userData.username;
          }
        }

        setUser({
          uid,
          role: userData.role || "student",
          name:
            userData.username ||
            userData.name ||
            currentUser.displayName ||
            "User",
          photoURL:
            userData.photoURL || currentUser.photoURL || "/default-avatar.jpg",
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const unsubVideos = onSnapshot(
      collection(db, "videos"),
      (snapshot) => {
        setVideosData(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error loading videos:", error)
    );

    const unsubTeachers = onSnapshot(
      collection(db, "teachers"),
      (snapshot) => {
        setTeachersData(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error loading teachers:", error)
    );

    return () => {
      unsubVideos();
      unsubTeachers();
    };
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleLogin = (loginData) => {
    setUser((prev) => ({
      ...prev,
      name: loginData.username || prev?.name,
      role: loginData.role || prev?.role,
      photoURL: prev?.photoURL || "/default-avatar.jpg",
    }));
  };

  if (!isAuthReady) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      {/* === Хедери === */}
      {user?.role === "student" && (
        <Header
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onLogout={handleLogout}
          photoURL={user.photoURL || "/default-avatar.jpg"}
        />
      )}
      {user?.role === "teacher" && (
        <TeacherHeader
          onLogout={handleLogout}
          photoURL={user.photoURL || "/default-avatar.jpg"}
        />
      )}

      <Routes>
        {/* AUTH */}
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

        {/* STUDENT ROUTES */}
        {user?.role === "student" && (
          <>
            <Route
              path="/Courses"
              element={
                <Courses
                  recommendedVideos={videosData}
                  searchTerm={searchTerm}
                  userName={user.name}
                />
              }
            />
            <Route
              path="/Lessons"
              element={
                <Lessons
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
            <Route
              path="/student/myprofile"
              element={<MyProfileS user={user} setUser={setUser} />}
            />
            <Route path="*" element={<Navigate to="/Lessons" replace />} />
            <Route
              path="/video/:id"
              element={<VideoPlayer videos={videosData} user={user} />}
            />
          </>
        )}

        {/* TEACHER ROUTES */}
        {user?.role === "teacher" && (
          <>
            <Route path="/teacher/home" element={<Home />} />
            <Route path="/teacher/chat" element={<Chat />} />
            <Route path="/teacher/myprofile" element={<MyProfileT />} />
            <Route path="/teacher/addvideo" element={<AddVideo />} />
            <Route path="/teacher/addvideo/:id" element={<AddVideo />} />
            <Route
              path="/teacher/course/:id/builder"
              element={<CourseBuilder />}
            />{" "}
            {/* НОВИЙ РОУТ */}
            <Route path="*" element={<Navigate to="/teacher/home" replace />} />
          </>
        )}

        {!user && <Route path="/*" element={<Navigate to="/auth" replace />} />}
      </Routes>
    </Router>
  );
};

export default App;
