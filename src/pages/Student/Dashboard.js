import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import TeacherCard from "../../components/TeacherCard";
import { auth } from "../../utils/firebase";
import "./Dashboard.css";

const Dashboard = ({
  allTeachers = [],
  recommendedVideos = [],
  searchTerm = "",
}) => {
  const userId = auth.currentUser?.uid;
  const [savedVideoIds, setSavedVideoIds] = useState([]);
  const [savedTeacherIds, setSavedTeacherIds] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const savedV = localStorage.getItem(`savedCourses_${userId}`);
    setSavedVideoIds(savedV ? JSON.parse(savedV).map(String) : []);
    const savedT = localStorage.getItem(`savedTeachers_${userId}`);
    setSavedTeacherIds(savedT ? JSON.parse(savedT).map(String) : []);
  }, [userId]);

  const handleSaveVideo = (id) => {
    const strId = String(id);
    const updated = savedVideoIds.includes(strId)
      ? savedVideoIds.filter((v) => v !== strId)
      : [...savedVideoIds, strId];
    setSavedVideoIds(updated);
    localStorage.setItem(`savedCourses_${userId}`, JSON.stringify(updated));
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
          )))
  );

  return (
    <div className="dashboard">
      <div className="content">
        <h2 className="headerText">📘 Courses</h2>
        <div className="cardContainer">
          {filteredVideos.length === 0 ? (
            <p>No saved courses found</p>
          ) : (
            filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video?.title || "Untitled"}
                teacher={video?.teacher || "Unknown"}
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
            filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                id={teacher.id}
                name={teacher?.name || "Unknown"}
                description={teacher?.description || ""}
                filters={Array.isArray(teacher?.tags) ? teacher.tags : []}
                onSave={handleSaveTeacher}
                isSaved={savedTeacherIds.includes(String(teacher.id))}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
