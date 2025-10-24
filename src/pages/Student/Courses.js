import React, { useState, useEffect } from "react";
import VideoCard from "../../components/VideoCard"; // ✅ Виправлений імпорт (видалено .jsx)
import Header from "../../components/Header"; // ✅ Виправлений імпорт (видалено .jsx)
import "./Courses.css"; // ✅ Залишено імпорт стилів

// ✅ Приймаємо recommendedVideos та searchTerm як пропси від App.jsx
const Courses = ({ recommendedVideos, searchTerm }) => {
  const name = "Anastasiia"; // 1. ЛОГІКА ФІЛЬТРАЦІЇ // Цей код фільтрує пропс recommendedVideos на основі глобального searchTerm

  const filteredVideos = recommendedVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const videosToDisplay = searchTerm ? filteredVideos : recommendedVideos; // ✅ videosToDisplay тепер визначена // ✅ Стан для збережених курсів (ЗАЛИШАЄМО ЛОКАЛЬНО)

  const [savedIds, setSavedIds] = useState(() => {
    const saved = localStorage.getItem("savedCourses");
    return saved ? JSON.parse(saved) : [];
  }); // ✅ Збереження у localStorage

  useEffect(() => {
    localStorage.setItem("savedCourses", JSON.stringify(savedIds));
  }, [savedIds]); // ✅ Обробник кліку на "закладку"

  const handleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div className="content">
        <h1 className="headerText">
          Hi, {name} <br />Here are recommendations {" "}
        </h1>
        <div className="cardContainer">
          {videosToDisplay.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              teacher={video.teacher}
              onSave={handleSave}
              isSaved={savedIds.includes(video.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
