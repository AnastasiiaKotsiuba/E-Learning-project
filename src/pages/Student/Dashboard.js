import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard";
import TeacherCard from "../../components/TeacherCard";
import "./Dashboard.css";
import Header from "../../components/Header";

const Dashboard = ({ allTeachers, recommendedVideos }) => {
  // === СТАНИ ТА ІНІЦІАЛІЗАЦІЯ З LOCALSTORAGE ===
  const [savedVideoIds, setSavedVideoIds] = useState([]);
  const [savedTeacherIds, setSavedTeacherIds] = useState([]);

  // Отримуємо збережені ID з localStorage
  useEffect(() => {
    const savedCourses = localStorage.getItem("savedCourses");
    if (savedCourses) setSavedVideoIds(JSON.parse(savedCourses));

    const savedTeachers = localStorage.getItem("savedTeachers");
    if (savedTeachers) setSavedTeacherIds(JSON.parse(savedTeachers));
  }, []);

  // Отримуємо збережені ID з localStorage
  useEffect(() => {
    const savedCourses = localStorage.getItem("savedCourses");
    if (savedCourses) setSavedVideoIds(JSON.parse(savedCourses));

    const savedTeachers = localStorage.getItem("savedTeachers");
    if (savedTeachers) setSavedTeacherIds(JSON.parse(savedTeachers));
  }, []);

  // Фільтруємо лише збережені курси
  const savedVideos = recommendedVideos.filter((v) =>
    savedVideoIds.includes(v.id)
  );

  // Фільтруємо лише збережених викладачів
  const savedTeachers = allTeachers.filter((t) =>
    savedTeacherIds.includes(t.id)
  );

  // ===============================================

  // === ЛОГІКА ВИДАЛЕННЯ (НОВЕ) ===

  /**
   * Оновлює стан збережених відео та localStorage.
   * Функція автоматично видаляє ID, оскільки вона викликається на сторінці 'Saved'.
   * @param {number} id - ID курсу для видалення.
   */
  const handleSaveVideo = (id) => {
    setSavedVideoIds((prevIds) => {
      const newIds = prevIds.filter((videoId) => videoId !== id);
      localStorage.setItem("savedCourses", JSON.stringify(newIds));
      return newIds;
    });
  };

  /**
   * Оновлює стан збережених викладачів та localStorage.
   * @param {number} id - ID викладача для видалення.
   */
  const handleSaveTeacher = (id) => {
    setSavedTeacherIds((prevIds) => {
      const newIds = prevIds.filter((teacherId) => teacherId !== id);
      localStorage.setItem("savedTeachers", JSON.stringify(newIds));
      return newIds;
    });
  };

  // ===============================================

  // === РЕНДЕРИНГ ===
  return (
    <div className="dashboard">
      <div className="content">
        <h2 className="headerText">📘 Saved Courses</h2>

        {savedVideos.length === 0 ? (
          <p>here is nothing yet</p>
        ) : (
          <div className="cardContainer">
            {savedVideos.map((video) => (
              <VideoCard
                key={`video-${video.id}`}
                id={video.id}
                title={video.title}
                teacher={video.teacher}
                // isSaved = true, оскільки вони у цьому списку
                isSaved={true}
                // ✅ ПЕРЕДАЄМО ФУНКЦІЮ ВИДАЛЕННЯ
                onSave={handleSaveVideo}
              />
            ))}
          </div>
        )}

        <h2 className="headerText">👩‍🏫 Saved Teachers</h2>

        {savedTeachers.length === 0 ? (
          <p>here is nothing yet</p>
        ) : (
          <div className="cardContainer">
            {savedTeachers.map((teacher) => (
              <TeacherCard
                key={`teacher-${teacher.id}`}
                id={teacher.id}
                name={teacher.name}
                description={teacher.description}
                filters={teacher.filters}
                // isSaved = true, оскільки вони у цьому списку
                isSaved={true}
                // ✅ ПЕРЕДАЄМО ФУНКЦІЮ ВИДАЛЕННЯ
                onSave={handleSaveTeacher}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
