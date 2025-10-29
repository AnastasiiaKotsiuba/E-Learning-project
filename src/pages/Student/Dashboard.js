import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import TeacherCard from "../../components/TeacherCard";
import { auth, db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Dashboard.css";

const Dashboard = ({
  allTeachers = [],
  recommendedVideos = [],
  searchTerm = "",
}) => {
  const userId = auth.currentUser?.uid;
  const [savedVideoIds, setSavedVideoIds] = useState([]);
  const [savedTeacherIds, setSavedTeacherIds] = useState([]);
  const [teachersMap, setTeachersMap] = useState({});

  useEffect(() => {
    if (!userId) return;
    const savedV = localStorage.getItem(`savedLessons_${userId}`);
    setSavedVideoIds(savedV ? JSON.parse(savedV).map(String) : []);
    const savedT = localStorage.getItem(`savedTeachers_${userId}`);
    setSavedTeacherIds(savedT ? JSON.parse(savedT).map(String) : []);
  }, [userId]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const snapshot = await getDocs(collection(db, "teachers"));
      const map = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        map[doc.id] = {
          name: data.name || "Unknown",
          email: data.email || "No email",
          description: data.description || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          photoURL: data.photoURL || "/default-avatar.jpg",
        };
      });
      setTeachersMap(map);
    };
    fetchTeachers();
  }, []);

  const handleSaveVideo = (id) => {
    const strId = String(id);
    const updated = savedVideoIds.includes(strId)
      ? savedVideoIds.filter((v) => v !== strId)
      : [...savedVideoIds, strId];
    setSavedVideoIds(updated);
    localStorage.setItem(`savedLessons_${userId}`, JSON.stringify(updated));
  };

  const handleSaveTeacher = (id) => {
    const strId = String(id);
    const updated = savedTeacherIds.includes(strId)
      ? savedTeacherIds.filter((t) => t !== strId)
      : [...savedTeacherIds, strId];
    setSavedTeacherIds(updated);
    localStorage.setItem(`savedTeachers_${userId}`, JSON.stringify(updated));
  };

  const filteredVideos = (
    Array.isArray(recommendedVideos) ? recommendedVideos : []
  ).filter(
    (video) =>
      savedVideoIds.includes(String(video.id)) &&
      (String(video?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        String(video?.teacher || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (Array.isArray(video?.tags) &&
          video.tags.some((tag) =>
            String(tag).toLowerCase().includes(searchTerm.toLowerCase())
          )))
  );

  const filteredTeachers = (
    Array.isArray(allTeachers) ? allTeachers : []
  ).filter(
    (teacher) =>
      savedTeacherIds.includes(String(teacher.id)) &&
      (String(teacher?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        String(teacher?.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (Array.isArray(teacher?.tags) &&
          teacher.tags.some((tag) =>
            String(tag).toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
        true)
  );

  return (
    <div className="dashboard">
      <div className="content">
        <h2 className="headerText">📘 Lessons</h2>
        <div className="cardContainer">
          {filteredVideos.length === 0 ? (
            <p>No saved Lessons found</p>
          ) : (
            filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video?.title || "Untitled"}
                teacher={video?.teacher || "Unknown"}
                teacherPhotoURL={
                  teachersMap[video?.teacherId]?.photoURL ||
                  "/default-avatar.jpg"
                }
                thumbnail={video?.thumbnail || "/vCard.jpg"}
                filters={Array.isArray(video?.tags) ? video.tags : []}
                onSave={handleSaveVideo}
                isSaved={savedVideoIds.includes(String(video.id))}
              />
            ))
          )}
        </div>

        <h2 className="headerText">👩‍🏫 Teachers</h2>
        <div className="cardContainer">
          {filteredTeachers.length === 0 ? (
            <p>No saved teachers found</p>
          ) : (
            filteredTeachers.map((teacher) => {
              const data = teachersMap[teacher.id] || {};
              return (
                <TeacherCard
                  key={teacher.id}
                  id={teacher.id}
                  name={data.name}
                  description={data.description}
                  email={data.email}
                  tags={data.tags}
                  photoURL={data.photoURL}
                  onSave={handleSaveTeacher}
                  isSaved={savedTeacherIds.includes(String(teacher.id))}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
