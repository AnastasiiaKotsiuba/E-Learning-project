import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";

import Header from "./components/Header";
import TeacherHeader from "./components/TeacherHeader";

import Courses from "./pages/Student/Courses";
import Lessons from "./pages/Student/Lessons";
import CourseView from "./pages/Student/CourseView";
import TeachersPage from "./pages/Student/Teachers";
import Dashboard from "./pages/Student/Dashboard";
import StudentHome from "./pages/Student/StudentHome";
import VideoPlayer from "./pages/Student/VideoPlayer";
import AboutCourse from "./pages/Student/AboutCourse";
import MyProfileS from "./pages/Student/MyProfileS";
import TeacherProfile from "./pages/Student/TeacherProfile";

import AddVideo from "./pages/Teacher/CreateContent";
import Home from "./pages/Teacher/Home";
import MyProfileT from "./pages/Teacher/MyProfileT";
import CourseBuilder from "./pages/Teacher/CourseBuilder";

import AuthPage from "./pages/Auth/AuthPage";
import Footer from "./components/Footer";

import { auth, db } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

const VideoPlayerWrapper = ({ videos, user }) => {
  const { id } = useParams();
  return <VideoPlayer key={id} videos={videos} user={user} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [videosData, setVideosData] = useState([]);
  const [teachersData, setTeachersData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
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

    const unsubCourses = onSnapshot(
      collection(db, "courses"),
      (snapshot) => {
        setCoursesData(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      },
      (error) => console.error("Error loading courses:", error)
    );

    return () => {
      unsubVideos();
      unsubTeachers();
      unsubCourses();
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
      {user?.role === "student" && (
        <Header
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onLogout={handleLogout}
          photoURL={user.photoURL || "/default-avatar.jpg"}
          videosData={videosData}
          coursesData={coursesData}
        />
      )}
      {user?.role === "teacher" && (
        <TeacherHeader
          onLogout={handleLogout}
          photoURL={user.photoURL || "/default-avatar.jpg"}
        />
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

        {user?.role === "student" && (
          <>
            <Route
              path="/"
              element={
                <StudentHome
                  recommendedVideos={videosData}
                  userName={user.name}
                />
              }
            />
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
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route
              path="/video/:id"
              element={<VideoPlayerWrapper videos={videosData} user={user} />}
            />
            <Route
              path="/course/:id"
              element={<AboutCourse videos={videosData} user={user} />}
            />
            <Route
              path="/course/:id/view"
              element={<CourseView user={user} />}
            />
            <Route
              path="/teacher-profile/:id"
              element={<TeacherProfile user={user} />}
            />
          </>
        )}

        {user?.role === "teacher" && (
          <>
            <Route path="/teacher/home" element={<Home />} />
            <Route path="/teacher/myprofile" element={<MyProfileT setUser={setUser} />} />
            <Route path="/teacher/addvideo" element={<AddVideo />} />
            <Route path="/teacher/addvideo/:id" element={<AddVideo />} />
            <Route
              path="/teacher/course/:id/builder"
              element={<CourseBuilder />}
            />
            <Route path="*" element={<Navigate to="/teacher/home" replace />} />
          </>
        )}

        {!user && <Route path="/*" element={<Navigate to="/auth" replace />} />}
      </Routes>

      {user && <Footer role={user.role} />}
    </Router>
  );
};

export default App;


