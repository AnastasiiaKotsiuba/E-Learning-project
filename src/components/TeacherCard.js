import React from "react";
import "./TeacherCard.css";

const TeacherCard = ({ name, description, filters, id, onSave, isSaved }) => {
  const handleSaveClick = () => {
    onSave(id); // Цей виклик тепер використовує оновлену логіку Teacher.js
  };

  return (
    <div className="teacher-card">
      <div className="teacher-header">
        <img src="/teacher.jpg" alt="teacherImg" className="teacherImg" />
        <div className="teacher-info">
          <h2>{name}</h2>
          <p className="titleCard">{filters.join(" ")}</p>
        </div>
        <img
          // Ця логіка тепер працює коректно завдяки правильному isSaved з Teacher.js
          src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"}
          alt="savedFunc"
          className="savedFunc"
          onClick={handleSaveClick}
        />
      </div>

      <div className="filtersTCard">
        {filters &&
          filters.map((filter, index) => (
            <h3 key={index} className="filters">
              {filter}
            </h3>
          ))}
      </div>
      <p className="teacher-description">{description}</p>
      <button className="show-more-btn">Show more</button>
    </div>
  );
};

export default TeacherCard;
