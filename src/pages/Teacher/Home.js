import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import VideoCard from "../../components/VideoCard";
import "./Home.css";

const Home = ({ allTeachers }) => {
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const [name, setName] = useState("User");
  const [videos, setVideos] = useState([]);
  const [teacherMap, setTeacherMap] = useState({});

  useEffect(() => {
    if (Array.isArray(allTeachers)) {
      const map = {};
      allTeachers.forEach((t) => (map[t.id] = t));
      setTeacherMap(map);
    }
  }, [allTeachers]);

  useEffect(() => {
    const fetchName = async () => {
      if (!uid) return;
      const snap = await getDoc(doc(db, "teachers", uid));
      if (snap.exists()) {
        const data = snap.data();
        setName(data.username || data.name || "User");
      }
    };
    fetchName();
  }, [uid]);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!uid) return;
      const q = query(collection(db, "videos"), where("teacherId", "==", uid));
      const querySnap = await getDocs(q);
      setVideos(querySnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchVideos();
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
              filters={v.tags}
              thumbnail={v.thumbnail}
              role="teacher"
              photoURL={
                teacherMap[v.teacherId]?.photoURL || "/default-avatar.png"
              }
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
