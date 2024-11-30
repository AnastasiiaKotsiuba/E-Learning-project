import React from "react";
import "./VideoCard.css";

const VideoCard = ({ title, teacher }) => {
  return (
    <div className="video-card">
      <img src="/vCard.jpg" alt="card" className="vCard" />
      <div className="teacherCard">
        <img src="/teacher.jpg" alt="teacherImg" className="teacherImg" />
        <h2>{teacher}</h2>
        <img src="/Saved.svg" alt="savedFunc" className="savedFunc" />
      </div>
      <div className="filtersCard">
        <h3>JavaScript</h3>
        <h3>HTML</h3>
      </div>
      <p className="titleCard">{title}</p>
    </div>
  );
};

export default VideoCard;
