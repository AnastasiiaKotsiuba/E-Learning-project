import React, { useState } from "react";
import "./VideoCard.css";

const VideoCard = ({ title, teacher, id, filters, onSave, isSaved }) => {
  const handleSaveClick = () => {
    onSave(id); // Викликає функцію з Courses.js
  };

  return (
    <div className="video-card">
      <img src="/vCard.jpg" alt="card" className="vCard" />

      <div className="teacherCard">
        <img src="/teacher.jpg" alt="teacherImg" className="teacherImg" />
        <h2>{teacher}</h2>
        <img
          src={isSaved ? "/SavedFilled.svg" : "/Saved.svg"}
          alt="savedFunc"
          className="savedFunc"
          onClick={handleSaveClick}
        />
      </div>

      <div className="filtersCard">
        {(Array.isArray(filters) ? filters : []).map((filter, index) => (
          <h3 key={index} className="filters">
            {filter}
          </h3>
        ))}
      </div>
      <p className="titleCard">{title}</p>
      <button className="watch-btn">Watch now</button>
    </div>
  );
};

export default VideoCard;
