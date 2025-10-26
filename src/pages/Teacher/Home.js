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
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;

  const [name, setName] = useState(() => {
    if (!uid) return "User";
    const saved = localStorage.getItem(`teacher_name_${uid}`);
    return saved || "User";
  });

  const [userPhoto, setUserPhoto] = useState(() => {
    if (!uid) return "/default-avatar.png";
    const saved = localStorage.getItem(`teacher_photo_${uid}`);
    return saved || "/default-avatar.png";
  });

  const [videos, setVideos] = useState([]);

  // Підвантаження відео вчителя
  useEffect(() => {
    if (!uid) return;

    const fetchVideos = async () => {
      const q = query(collection(db, "videos"), where("teacherId", "==", uid));
      const snapshot = await getDocs(q);
      setVideos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchVideos();
  }, [uid]);

  // Підвантаження даних вчителя
  useEffect(() => {
    if (!uid) return;

    const fetchTeacherData = async () => {
      const snap = await getDoc(doc(db, "teachers", uid));
      if (snap.exists()) {
        const data = snap.data();
        const teacherName = data.name || data.username || "User";
        const teacherPhoto =
          data.photoURL || auth.currentUser?.photoURL || "/default-avatar.png";

        setName(teacherName);
        setUserPhoto(teacherPhoto);
        localStorage.setItem(`teacher_name_${uid}`, teacherName);
        localStorage.setItem(`teacher_photo_${uid}`, teacherPhoto);
      } else {
        setName(auth.currentUser?.displayName || "User");
        setUserPhoto(auth.currentUser?.photoURL || "/default-avatar.png");
      }
    };

    fetchTeacherData();
  }, [uid]);

  return (
    <div className="content">
      <h1 className="headerText">
        Hi, {name} 👋 <br /> Here are your videos
      </h1>

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
              userRole="teacher" // ⚡ кнопка буде "Edit Video"
            />
          ))
        ) : (
          <p>No videos yet. Click “+” to add one 🎥</p>
        )}
      </div>

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
