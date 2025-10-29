import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import VideoCard from "../../components/VideoCard";
import CourseEditorCard from "../../components/CourseEditorCard";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const [name, setName] = useState("Teacher");
  const [userPhoto, setUserPhoto] = useState("/default-avatar.jpg");
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!uid) return;

    const fetchTeacherData = async () => {
      const snap = await getDoc(doc(db, "teachers", uid));
      if (snap.exists()) {
        const data = snap.data();
        const teacherName = data.name || "Teacher";
        const teacherPhoto = data.photoURL || "/default-avatar.jpg";

        setName(teacherName);
        setUserPhoto(teacherPhoto);
        localStorage.setItem(`teacher_name_${uid}`, teacherName);
        localStorage.setItem(`teacher_photo_${uid}`, teacherPhoto);
      }
    };

    fetchTeacherData();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const fetchVideos = async () => {
      const q = query(collection(db, "videos"), where("teacherId", "==", uid));
      const snapshot = await getDocs(q);
      setVideos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchVideos();
  }, [uid]);

  useEffect(() => {
    if (!uid) return;

    const fetchCourses = async () => {
      const q = query(collection(db, "courses"), where("teacherId", "==", uid));
      const snapshot = await getDocs(q);
      const loadedCourses = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setCourses(loadedCourses);
    };

    fetchCourses();
  }, [uid]);

  return (
    <div className="content">
      <h1 className="headerText">Hi, {name} 👋</h1>

      <section className="content-section">
        <h2 className="homeUnderheader">Your Courses</h2>
        <div className="video-grid">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseEditorCard
                key={course.id}
                id={course.id}
                title={course.title}
                teacher={name}
                teacherPhotoURL={userPhoto}
                thumbnail={course.thumbnail}
                filters={course.tags || []}
                status={course.status || "draft"}
              />
            ))
          ) : (
            <p>No courses yet. Create one!</p>
          )}
        </div>
      </section>

      <section className="content-section">
        <h2 className="homeUnderheader">Your Videos</h2>
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map((v) => (
              <VideoCard
                key={v.id}
                id={v.id}
                title={v.title}
                teacher={name}
                teacherPhotoURL={userPhoto}
                filters={v.tags || []}
                thumbnail={v.thumbnail || "/vCard.jpg"}
                userRole="teacher"
              />
            ))
          ) : (
            <p>No videos yet. Click “+” to add one</p>
          )}
        </div>
      </section>

      <button
        className="add-video-btn"
        onClick={() => navigate("/teacher/addvideo")}
      >
        +
      </button>
    </div>
  );
};

export default Home;
