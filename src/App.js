import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import TeacherHeader from "./components/TeacherHeader";

import Courses from "./pages/Student/Courses";
import TeachersPage from "./pages/Student/Teachers";
import Dashboard from "./pages/Student/Dashboard";
import AuthPage from "./pages/Auth/AuthPage";
import AddVideo from "./pages/Teacher/AddVideo";
import Home from "./pages/Teacher/Home";
import Chat from "./pages/Teacher/Chat";
import MyProfileT from "./pages/Teacher/MyProfileT";
import MyProfileS from "./pages/Student/MyProfileS";

import { auth, db } from "./utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [videosData, setVideosData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // -------------------------
  // Авторизація та user state
  // -------------------------
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const uid = currentUser.uid;
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        setUser({
          uid,
          role: userData.role || "student",
          name: userData.name || currentUser.displayName || "User",
          photoURL:
            userData.photoURL || currentUser.photoURL || "/default-avatar.png",
        });
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  // -------------------------
  // Відео та вчителі
  // -------------------------
  useEffect(() => {
    const unsubVideos = onSnapshot(collection(db, "videos"), (snapshot) => {
      const vids = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setVideosData(vids);
    });

    const unsubTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
      const teachers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeachersData(teachers);
    });

    return () => {
      unsubVideos();
      unsubTeachers();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (!isAuthReady) return <div>Loading...</div>;

  return (
    <Router>
      {user?.role === "student" && (
        <Header
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onLogout={handleLogout}
          photoURL={user.photoURL}
        />
      )}
      {user?.role === "teacher" && (
        <TeacherHeader onLogout={handleLogout} photoURL={user.photoURL} />
      )}

      <Routes>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />

        {user?.role === "student" && (
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
            <Route
              path="/student/myprofile"
              element={<MyProfileS user={user} setUser={setUser} />}
            />
            <Route path="*" element={<Navigate to="/courses" replace />} />
          </>
        )}

        {user?.role === "teacher" && (
          <>
            <Route
              path="/teacher/home"
              element={<Home allTeachers={teachersData} />}
            />
            <Route path="/teacher/chat" element={<Chat />} />
            <Route path="/teacher/myprofile" element={<MyProfileT />} />
            <Route path="/teacher/addvideo" element={<AddVideo />} />
            <Route path="*" element={<Navigate to="/teacher/home" replace />} />
            <Route path="/teacher/addvideo/:id" element={<AddVideo />} />
          </>
        )}

        {!user && <Route path="/*" element={<Navigate to="/auth" replace />} />}
      </Routes>
    </Router>
  );
};

export default App;
