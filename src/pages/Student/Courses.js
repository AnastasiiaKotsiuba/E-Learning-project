import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import { auth, db } from "../../utils/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import "./Courses.css";

const Courses = ({ recommendedVideos = [], searchTerm = "" }) => {
  const uid = auth.currentUser?.uid;
  const [name, setName] = useState(() => {
    if (!uid) return "User";
    const saved = localStorage.getItem(`username_${uid}`);
    return saved || "User";
  });

  const [teachersMap, setTeachersMap] = useState({});

  useEffect(() => {
    const fetchUserName = async () => {
      if (!uid) return;
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const username = userDoc.data()?.name || "User";
        setName(username);
        localStorage.setItem(`username_${uid}`, username);
      }
    };
    fetchUserName();
  }, [uid]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const snapshot = await getDocs(collection(db, "teachers"));
      const map = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        map[data.name] = data.photoURL || "/default-avatar.png";
      });
      setTeachersMap(map);
    };
    fetchTeachers();
  }, []);

  const [savedIds, setSavedIds] = useState(() => {
    if (!uid) return [];
    const saved = localStorage.getItem(`savedCourses_${uid}`);
    return saved ? JSON.parse(saved).map(String) : [];
  });

  useEffect(() => {
    if (!uid) return;
    localStorage.setItem(`savedCourses_${uid}`, JSON.stringify(savedIds));
  }, [savedIds, uid]);

  const handleSave = (id) => {
    const strId = String(id);
    setSavedIds((prev) =>
      prev.includes(strId) ? prev.filter((v) => v !== strId) : [...prev, strId]
    );
  };

  const videosToDisplay = (
    Array.isArray(recommendedVideos) ? recommendedVideos : []
  ).filter((video) => {
    const term = searchTerm.toLowerCase();
    const inTitle = String(video?.title || "")
      .toLowerCase()
      .includes(term);
    const inTeacher = String(video?.teacher || "")
      .toLowerCase()
      .includes(term);
    const inTags =
      Array.isArray(video?.tags) &&
      video.tags.some((tag) => String(tag).toLowerCase().includes(term));
    return inTitle || inTeacher || inTags;
  });

  return (
    <div>
      <div className="content">
        <h1 className="headerText">
          Hi, {name} <br />
          Here are recommendations
        </h1>
        <div className="cardContainer">
          {videosToDisplay.length === 0 ? (
            <p>No courses found</p>
          ) : (
            videosToDisplay.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video?.title || "Untitled"}
                teacher={video?.teacher || "Unknown"}
                teacherPhotoURL={
                  teachersMap[video?.teacher] || "/default-avatar.png"
                }
                thumbnail={video?.thumbnail || "/vCard.jpg"}
                filters={Array.isArray(video?.tags) ? video.tags : []}
                onSave={handleSave}
                isSaved={savedIds.includes(String(video.id))}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
